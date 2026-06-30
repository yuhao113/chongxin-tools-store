import { createHmac, randomUUID } from "node:crypto";

export type LinePayProduct = {
  id: string;
  name: string;
  imageUrl?: string;
  quantity: number;
  price: number;
};

type LinePayApiResponse<T> = {
  returnCode: string;
  returnMessage: string;
  info?: T;
};

type RequestPaymentInfo = {
  paymentUrl: { web: string; app: string };
  transactionId: string;
  paymentAccessToken?: string;
};

type ConfirmPaymentInfo = {
  orderId: string;
  transactionId: string;
  payInfo?: Array<{ method: string; amount: number }>;
};

function config() {
  const channelId = process.env.LINE_PAY_CHANNEL_ID;
  const channelSecret = process.env.LINE_PAY_CHANNEL_SECRET;
  const environment = process.env.LINE_PAY_ENV === "production" ? "production" : "sandbox";
  const version = process.env.LINE_PAY_API_VERSION === "3" ? "3" : "4";

  if (!channelId || !channelSecret) {
    throw new Error("尚未設定 LINE_PAY_CHANNEL_ID 或 LINE_PAY_CHANNEL_SECRET。");
  }

  return {
    channelId,
    channelSecret,
    version,
    baseUrl: environment === "production"
      ? "https://api-pay.line.me"
      : "https://sandbox-api-pay.line.me"
  };
}

function parseLinePayJson<T>(text: string): T {
  // LINE Pay transactionId may exceed JavaScript's safe integer range.
  const protectedText = text.replace(/:\s*(\d{16,})\b/g, ': "$1"');
  return JSON.parse(protectedText) as T;
}

async function callLinePay<T>({
  apiPath,
  body
}: {
  apiPath: string;
  body: Record<string, unknown>;
}) {
  const { channelId, channelSecret, baseUrl } = config();
  const nonce = randomUUID();
  const requestBody = JSON.stringify(body);
  const rawSignature = `${channelSecret}${apiPath}${requestBody}${nonce}`;
  const signature = createHmac("sha256", channelSecret)
    .update(rawSignature)
    .digest("base64");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);

  try {
    const response = await fetch(`${baseUrl}${apiPath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-LINE-ChannelId": channelId,
        "X-LINE-Authorization-Nonce": nonce,
        "X-LINE-Authorization": signature
      },
      body: requestBody,
      cache: "no-store",
      signal: controller.signal
    });

    const text = await response.text();
    const data = parseLinePayJson<LinePayApiResponse<T>>(text);
    if (!response.ok || data.returnCode !== "0000") {
      throw new Error(`LINE Pay ${data.returnCode}: ${data.returnMessage}`);
    }
    if (!data.info) {
      throw new Error("LINE Pay 回應缺少 info 欄位。");
    }
    return data.info;
  } finally {
    clearTimeout(timeout);
  }
}

export async function requestLinePayPayment(input: {
  orderNo: string;
  amount: number;
  products: LinePayProduct[];
  confirmUrl: string;
  cancelUrl: string;
}) {
  const { version } = config();
  return callLinePay<RequestPaymentInfo>({
    apiPath: `/v${version}/payments/request`,
    body: {
      amount: input.amount,
      currency: "TWD",
      orderId: input.orderNo,
      packages: [
        {
          id: input.orderNo,
          amount: input.amount,
          products: input.products
        }
      ],
      redirectUrls: {
        confirmUrl: input.confirmUrl,
        cancelUrl: input.cancelUrl
      }
    }
  });
}

export async function confirmLinePayPayment(input: {
  transactionId: string;
  amount: number;
}) {
  const { version } = config();
  return callLinePay<ConfirmPaymentInfo>({
    apiPath: `/v${version}/payments/${encodeURIComponent(input.transactionId)}/confirm`,
    body: {
      amount: input.amount,
      currency: "TWD"
    }
  });
}
