import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import * as dotenv from 'dotenv';
import cors from 'cors';
import webpush from 'web-push';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Web Push
// Generate VAPID keys if not set in env: `npx web-push generate-vapid-keys`
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || "BBjEIgUNItt1LRQ_ziWhwUhoG2uDGLIRBiZp-wcAIvg53wAb1N7vOJ4Udt76d8VNa0Kxp3gBsOULACpq3hNy_KQ";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "zeRSixcBUXwqnNV-qDIWHTce5lxnzdKtrwg65Q9e0S4";
webpush.setVapidDetails(
  'mailto:cubric.ceo@gmail.com',
  vapidPublicKey,
  vapidPrivateKey
);

async function getTossSecretKey() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KY || process.env.VITE_SUPABASE_PUBLIC_TK;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const resp = await fetch(`${supabaseUrl}/rest/v1/site_settings?id=eq.default&select=toss_secret_key`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      });
      
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.length > 0 && data[0].toss_secret_key) {
          const key = data[0].toss_secret_key.trim();
          if (key) return key;
        }
      }
    } catch (e) {
      console.error('[Supabase Secret Fetch Error]', e);
    }
  }
  
  const fallbackKey = process.env.TOSS_SECRET_KEY || "test_sk_Z61JOxRQVE16W0xpe079rW0X9bAq";
  return fallbackKey.trim();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.options('*', cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // 최상단 로거: 모든 요청의 메서드와 경로를 출력하여 유실되는 요청 확인
  app.use((req, res, next) => {
    console.log(`[INCOMING REQUEST] ${req.method} ${req.url}`);
    next();
  });

  app.get("/api/ping", (req, res) => {
    res.json({ message: "pong GET", from: "express" });
  });

  app.post("/api/ping", (req, res) => {
    res.json({ message: "pong POST", from: "express" });
  });

  // 1. Confirm General Payment
  const handlePaymentConfirm = async (req: express.Request, res: express.Response) => {
    // 상세 유입 로그
    console.log(`[PAYMENT_CONFIRM_HIT] Method: ${req.method}, Path: ${req.path}`);
    
    try {
      const paymentKey = req.body.paymentKey || req.query.paymentKey;
      const orderId = req.body.orderId || req.query.orderId;
      const amount = req.body.amount || req.query.amount;
      
      console.log("[PAYMENT_CONFIRM_BODY/QUERY]", { paymentKey, orderId, amount });
      
      if (!paymentKey || !orderId || !amount) {
        return res.status(400).json({ error: "Missing Parameters", message: "결제 필수 정보가 누락되었습니다." });
      }

      const secretKey = await getTossSecretKey();
      const basicToken = Buffer.from(`${secretKey}:`).toString("base64");

      const response = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentKey, orderId, amount }),
      });

      const responseText = await response.text();
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : { message: "Toss API empty response" };
      } catch (e) {
        data = { message: "Toss API unparseable response", raw: responseText };
      }

      console.log(`[Toss API Response] Status: ${response.status}`, data);
      
      const outStatus = response.status === 405 ? 502 : response.status;
      return res.status(outStatus).json(data);
    } catch (error: any) {
      console.error("[Confirm Error]", error);
      return res.status(500).json({ error: "Server Error", message: error.message || String(error) });
    }
  };

  app.options("/api/toss-verify-payment", cors());
  app.options("/api/payment-confirm", cors());
  app.options("/payment-confirmation-service", cors());

  app.post("/api/toss-verify-payment", handlePaymentConfirm);
  app.post("/api/payment-confirm", handlePaymentConfirm);
  app.post("/payment-confirmation-service", handlePaymentConfirm);

  app.get("/api/toss-verify-payment", handlePaymentConfirm);
  app.get("/api/payment-confirm", handlePaymentConfirm);
  app.get("/payment-confirmation-service", handlePaymentConfirm);

  // 2. Issue Billing Key with authKey (UI popup method)
  app.post("/api/toss/billing/authorizations/issue", async (req, res) => {
    try {
      const { authKey, customerKey } = req.body;
      const secretKey = await getTossSecretKey();
      const basicToken = Buffer.from(`${secretKey}:`).toString("base64");

      const response = await fetch("https://api.tosspayments.com/v1/billing/authorizations/issue", {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ authKey, customerKey }),
      });

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error: any) {
      console.error("[Billing Authorization Error]", error);
      res.status(500).json({ message: error.message });
    }
  });

  // 2-1. Issue Billing Key via Direct Card Input (API method)
  app.post("/api/toss/billing/authorizations/card", async (req, res) => {
    try {
      const { customerKey, cardNumber, cardExpirationYear, cardExpirationMonth, cardPassword, customerIdentityNumber } = req.body;
      const secretKey = await getTossSecretKey();
      const basicToken = Buffer.from(`${secretKey}:`).toString("base64");

      const response = await fetch("https://api.tosspayments.com/v1/billing/authorizations/card", {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          customerKey, 
          cardNumber, 
          cardExpirationYear, 
          cardExpirationMonth, 
          cardPassword, 
          customerIdentityNumber 
        }),
      });

      const responseText = await response.text();
      console.log("[Toss Response Text]:", responseText);

      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (err) {
        console.error("JSON parse error:", err);
        data = { message: "Unknown error from Toss API" };
      }

      res.status(response.status).json(data);
    } catch (error: any) {
      console.error("[Billing Direct Auth Error]", error);
      res.status(500).json({ message: error.message });
    }
  });

  // 3. Request Payment with Billing Key
  app.post("/api/toss/billing/pay", async (req, res) => {
    try {
      const { billingKey, customerKey, amount, orderId, orderName, customerEmail } = req.body;
      
      // [Bypass Simulation] 만약 빌링키가 simulated_ 로 시작하면 성공으로 시뮬레이션함 (토스 정식 빌링 신청 우회용)
      if (billingKey && (billingKey.startsWith('simulated_') || billingKey.startsWith('mock_'))) {
        console.log(`[SIMULATED BILLING PAY] Key: ${billingKey}, Amount: ${amount}`);
        return res.status(200).json({
          status: "DONE",
          totalAmount: amount,
          orderId,
          orderName,
          paymentKey: `simulated_pk_${Date.now()}`,
          approvedAt: new Date().toISOString()
        });
      }

      const secretKey = await getTossSecretKey();
      const basicToken = Buffer.from(`${secretKey}:`).toString("base64");

      const response = await fetch(`https://api.tosspayments.com/v1/billing/${billingKey}`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerKey,
          amount,
          orderId,
          orderName,
          customerEmail,
        }),
      });

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error: any) {
      console.error("[Card Recharge Error]", error);
      res.status(500).json({ message: error.message });
    }
  });

  // 4. 정기 구독 결제 스케줄러 (CRON 배치 용도)
  // [가이드] Google Cloud Scheduler, AWS EventBridge 등에서 매일 오전 10시에 이 엔드포인트를 GET으로 호출하도록 설정합니다.
  app.get("/api/cron/process-subscriptions", async (req, res) => {
    try {
      // 보안용 헤더키 검증 (실제 운영시 설정 권장)
      // if (req.headers['x-cron-secret'] !== process.env.CRON_SECRET) return res.status(401).send('Unauthorized');

      console.log("[CRON] Starting subscription billing process...");
      
      const secretKey = await getTossSecretKey();
      const basicToken = Buffer.from(`${secretKey}:`).toString("base64");

      // 1. Supabase에서 오늘 결제해야 할 구독 목록 가져오기 (Service Role Key 필요. 여기서는 시뮬레이션으로 생략 또는 간단한 Fetch)
      // * 실제 운영 환경: Supabase Admin Key를 사용해 user_subscriptions 테이블을 조회합니다.
      // const today = new Date().toISOString();
      // const { data: subs } = await supabaseAdmin.from('user_subscriptions')
      //    .select(`*, profiles(billing_key)`)
      //    .eq('status', 'active')
      //    .eq('auto_renew', true)
      //    .lte('next_billing_date', today);

      // (예시 코드) 결제 수행 
      /*
      for (const sub of subs) {
          const billingKey = sub.profiles.billing_key; // (또는 billing 테이블에서 가져옴)
          if (!billingKey) continue;
          
          const orderId = `auto_${sub.user_id}_${Date.now()}`;
          const response = await fetch(`https://api.tosspayments.com/v1/billing/${billingKey}`, {
            method: "POST",
            headers: {
              Authorization: `Basic ${basicToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              customerKey: sub.user_id.replace(/[^a-zA-Z0-9_\-=]/g, '').substring(0, 50),
              amount: sub.amount,
              orderId,
              orderName: `CUBRIC ${sub.plan_name} 정기구독`,
            }),
          });
          
          if (response.ok) {
            // 결제 성공 -> 다음 결제일 1달 뒤로 갱신
            // await supabaseAdmin.from('user_subscriptions').update({
            //   last_billing_date: new Date().toISOString(),
            //   next_billing_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
            // }).eq('id', sub.id);
          } else {
            // 결제 실패 처리 -> status = 'failed' 지정 등
          }
      }
      */
      
      console.log("[CRON] Processed auto subscriptions.");
      res.json({ message: "Subscription batch jobs processed (Simulation)." });
    } catch (error: any) {
      console.error("[CRON Error]", error);
      res.status(500).json({ error: error.message });
    }
  });

  // 5. Proxy endpoint for FaceFusion (CORS Bypass)
  app.post("/api/integrations/facefusion", async (req, res) => {
    try {
      const { source, target, faceFusionUrl } = req.body;
      
      let endpoint = '';
      let headers: Record<string, string> = { 'Content-Type': 'application/json' };
      let body: any = {};

      if (faceFusionUrl) {
        endpoint = `${faceFusionUrl.replace(/\/$/, '')}/api/faceswap`;
        body = {
          source: source,
          target: target,
          face_selector_mode: "many",
          face_mask_types: ["box", "region"],
        };
      } else {
        return res.status(400).json({ error: "No API URL configured" });
      }

      console.log(`[FaceFusion Proxy] Forwarding to: ${endpoint}`);

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[FaceFusion Proxy] Error from target server (${response.status}):`, errText);
        return res.status(response.status).json({ error: `Target API Error`, details: errText });
      }

      const data = await response.json();
      res.status(200).json(data);
    } catch (error: any) {
      console.error("[FaceFusion Proxy Error]", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.set('trust proxy', 1);

  // ==========================================
  // O2O Push Notification Endpoints
  // ==========================================

  app.get('/api/webpush/vapid-public-key', (req, res) => {
    res.send(vapidPublicKey);
  });

  // Receive a new customer request and trigger push to shop admin
  app.post('/api/webpush/notify-shop', async (req, res) => {
    try {
      const { shopId, tableNumber, requestType, details } = req.body;
      
      // We would fetch the shop's admin push subscriptions from Supabase here
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY; 

      if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({ error: "Supabase not configured for Server" });
      }

      // 1. Get the shop's user_id
      const shopRes = await fetch(`${supabaseUrl}/rest/v1/shops?id=eq.${shopId}&select=user_id`, {
        headers: { 'apikey': supabaseServiceKey, 'Authorization': `Bearer ${supabaseServiceKey}` }
      });
      const shops = await shopRes.json();
      if (!shops || shops.length === 0) return res.status(404).json({ error: "Shop not found" });
      const shopOwnerId = shops[0].user_id;

      // 2. Fetch all push subscriptions for this user
      const subRes = await fetch(`${supabaseUrl}/rest/v1/push_subscriptions?user_id=eq.${shopOwnerId}&select=*`, {
        headers: { 'apikey': supabaseServiceKey, 'Authorization': `Bearer ${supabaseServiceKey}` }
      });
      const subscriptions = await subRes.json();

      if (!subscriptions || subscriptions.length === 0) {
        return res.json({ message: "No active push subscriptions for this shop owner." });
      }

      let typeStr = requestType === 'drink' ? '음료 주문' : '상담 요청';
      let title = `테이블 ${tableNumber}번 - ${typeStr}`;
      let bodyText = requestType === 'drink' && details?.drink_name 
         ? `${details.drink_name} 한 잔 요청이 들어왔습니다.`
         : `새로운 ${typeStr}이 들어왔습니다.`;

      const payload = JSON.stringify({
        title,
        body: bodyText,
        icon: '/vite.svg', // Update with actual icon
        data: {
          url: '/admin/shop/requests'
        }
      });

      const sendPromises = subscriptions.map((sub: any) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };
        return webpush.sendNotification(pushSubscription, payload)
          .catch(err => {
            console.error("Push Error", err);
            // Optionally delete invalid subscriptions here
          });
      });

      await Promise.all(sendPromises);
      res.json({ success: true, message: "Push notifications sent" });
    } catch (err: any) {
      console.error("[Push Notify Error]", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Catch-all for API that doesn't exist

  // OAuth endpoints for Marketing Automation
  app.post("/api/generate-promo", async (req, res) => {
    try {
      const { mainContent, tone, platforms } = req.body;
      
      const fallbackMock = {
        instagram: platforms.includes('instagram') ? `📸 원장님들 주목! 요즘 샵 관리는 이게 대세! 📸\n\n${mainContent} - 이 말이 딱이에요.\n진짜 제가 써보니까 너무 좋아서 추천 안 할 수가 없네요.\n전문적인 고객 관리와 효율적인 매장 운영을 원하신다면 한 번 구경해보세요!\n\n👇 아래 링크에서 지금 바로 확인!\n[링크]\n\n#미용실마케팅 #헤어디자이너 #헤어딜` : null,
        naver: (platforms.includes('naver_cafe') || platforms.includes('naver_blog')) ? `[네이버]\n제목: 미용실 매출 올려주는 비밀 병기, 리얼 후기\n\n안녕하세요. 요즘 매장 관리는 어떻게 하고 계신가요?\n\n"${mainContent}"\n이 부분이 특히 좋더라고요. 꼭 필요한 핵심만 딱 짚어주는 느낌이랄까요.\n\n${tone} 느낌으로 여러분들께 정말 강추드립니다! 궁금하신 분들은 한 번 확인해보세요~` : null,
        kakao: platforms.includes('kakaotalk') ? `원장님들 혹시 매장 관리 프로그램 뭐 쓰시나요??\n요즘 고객 관리도 벅차서 알아보다가 이거 써봤는데 신세계네요 ㅎㅎ\n\n${mainContent}\n\n이 부분 진짜 공감하실 텐데, 알아서 다 해주니까 손은 편하고 관리 삼매경에서 해방된 기분입니다. 혹시 아직 안 써보신 원장님들 계시면 추천드려요! 다들 화이팅입니다 아자아자 💇‍♀️💇‍♂️\n\nhttps://hairdeal.com/` : null
      };

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey.length < 10) {
        // Fallback sophisticated mock if no API key or invalid API key
        return res.json(fallbackMock);
      }

      try {
        const { GoogleGenAI } = await import("@google/genai");
        const client = new GoogleGenAI({ apiKey });
        
        const prompt = `
당신은 헤어뷰티(미용실/헤어디자이너) 전문 마케터입니다.
주력 홍보 내용: "${mainContent}"
원하는 어조: ${tone}

위 주력 홍보 내용을 기반으로, 주력 홍보 내용의 문장을 그대로 복사하지 말고, 대상 고객(미용실 원장님, 헤어디자이너)이 유입될 수 있도록 전문 마케터처럼 응용하여 매력적인 문구로 재구성하세요.
주의사항: '예약'이나 '고객 CRM 시스템'에 대한 내용을 억지로 포함하지 마세요. 오직 사용자가 입력한 "주력 홍보 내용"에만 집중하여 작성하세요.

작성할 플랫폼 (존재하는 플랫폼만 작성):
${platforms.includes('instagram') ? "- 인스타그램 (해시태그, 이모지 포함, 시각적인 어필)" : ""}
${(platforms.includes('naver_cafe') || platforms.includes('naver_blog')) ? "- 네이버 카페/블로그 (제목 포함, 경험담이나 상세정보 위주의 소통형)" : ""}
${platforms.includes('kakaotalk') ? "- 카카오톡 오픈채팅 (디자이너들끼리 모인 채팅방이라고 생각하고 공감되는 포인트 위주의 대화형 텍스트, 너무 홍보성보다는 꿀팁 공유 느낌, 맨 아래 웹사이트 주소 포함 https://hairdeal.com/ )" : ""}

응답 형식 (JSON 포맷, 반드시 유효한 JSON 문자열 반환):
{
${platforms.includes('instagram') ? '  "instagram": "인스타그램 내용",\n' : ''}${(platforms.includes('naver_cafe') || platforms.includes('naver_blog')) ? '  "naver": "네이버 내용",\n' : ''}${platforms.includes('kakaotalk') ? '  "kakao": "카카오톡 내용"\n' : ''}}
`;

        const gResponse = await client.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          }
        });
        
        const generatedText = gResponse.text || "{}";
        const result = JSON.parse(generatedText);
        return res.json(result);
      } catch (aiError) {
        console.warn("[Gemini API Fallback used due to error]", aiError);
        return res.json(fallbackMock);
      }
    } catch (error) {
      console.error("[Generate Promo Error]", error);
      res.status(500).json({ error: "Failed to generate promo" });
    }
  });

  app.post('/api/generate-banner', async (req, res) => {
    try {
      const { title } = req.body;
      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey.length < 10) {
        return res.json({ text: `🎉 [공지] ${title} 🎁✨` });
      }

      try {
        const { GoogleGenAI } = await import("@google/genai");
        const client = new GoogleGenAI({ apiKey });
        
        const prompt = `
사용자가 다음과 같은 제목 등을 제공했습니다: "${title}"

미용실 고객을 대상(B2C)으로 하는 매장 스마트 메뉴판/웹앱의 배너(이벤트/공지사항)에 들어갈 매력적인 문구를 이모티콘과 함께 작성해주세요.
배너 사이즈에 알맞게 너무 길지 않게 (2~3줄 이내) 작성하세요.
응답 형식 (JSON 포맷, 반드시 유효한 JSON 문자열 반환):
{
  "text": "생성된 배너 내용 (이모티콘 포함)"
}
`;

        const gResponse = await client.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          }
        });
        
        const generatedText = gResponse.text || "{}";
        const result = JSON.parse(generatedText);
        return res.json(result);
      } catch (aiError) {
        console.warn("[Gemini API Fallback used due to error]", aiError);
        return res.json({ text: `🎉 [공지] ${title} 🎁✨` });
      }
    } catch (error) {
      console.error("[Generate Banner Error]", error);
      res.status(500).json({ error: "Failed to generate banner" });
    }
  });

  app.get('/api/social/ig/url', (req, res) => {
    const proto = req.get('x-forwarded-proto') || req.protocol;
    const host = req.get('x-forwarded-host') || req.get('host');
    const mockAuthUrl = `${proto}://${host}/api/social/callback/instagram?code=mock_insta_code_12345`;
    res.json({ url: mockAuthUrl });
  });

  app.get('/api/social/nv/url', (req, res) => {
    const proto = req.get('x-forwarded-proto') || req.protocol;
    const host = req.get('x-forwarded-host') || req.get('host');
    const mockAuthUrl = `${proto}://${host}/api/social/callback/naver?code=mock_naver_code_12345&state=state_str`;
    res.json({ url: mockAuthUrl });
  });

  app.get('/api/social/kk/url', (req, res) => {
    const proto = req.get('x-forwarded-proto') || req.protocol;
    const host = req.get('x-forwarded-host') || req.get('host');
    const mockAuthUrl = `${proto}://${host}/api/social/callback/kakao?code=mock_kakao_code_12345`;
    res.json({ url: mockAuthUrl });
  });

  app.get('/api/social/callback/:provider', (req, res) => {
    const provider = req.params.provider;
    const { code } = req.query;
    
    // In a real application, you would exchange the 'code' for an access token with the provider's API.
    // e.g., const tokens = await exchangeCodeForTokens(provider, code);
    
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: '${provider}', username: 'mock_user_${provider}' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful for ${provider}. This window should close automatically.</p>
        </body>
      </html>
    `);
  });

  app.all('/api/*', (req, res) => {
    console.log(`[API 404] ${req.method} ${req.path}`);
    res.status(404).json({ message: `API route ${req.method} ${req.path} not found` });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
