import fs from 'fs';

const filePath = 'src/pages/AdminPage.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add states
const stateOld = 'const [userHistory, setUserHistory] = useState<any[]>([]);';
const stateNew = `const [userHistory, setUserHistory] = useState<any[]>([]);
  const [userHistoryPage, setUserHistoryPage] = useState(1);
  const [userHistoryHasMore, setUserHistoryHasMore] = useState(true);
  const [userHistoryLoadingMore, setUserHistoryLoadingMore] = useState(false);
  const [userHistoryStats, setUserHistoryStats] = useState({ total: 0, friend: 0, monthUsed: 0 });`;

content = content.replace(stateOld, stateNew);

// 2. Replace fetchUserHistory
const fetchOld = `  const fetchUserHistory = async (userId: string, userName: string) => {
    setViewHistoryUserId(userId);
    setViewHistoryUserName(userName);
    setLoadingHistory(true);

    let allNcpTxs: any[] = [];
    
    try {
      // Find user to map ncp_designer_id
      const profileInfo = profiles.find((p) => p.id === userId);
      const targetDesignerId = profileInfo?.ncp_account_id || profileInfo?.accountId || profileInfo?.ncp_designer_id || userId;

      let currentPage = 1;
      let keepFetching = true;

      while (keepFetching) {
        try {
          // Use the secure backend proxy which signs the token on behalf of the user
          const res = await fetch(\`/api/admin/user-credit-history?designerId=\${targetDesignerId}&pageNo=\${currentPage}&pageSize=50&month=12\`, {
             headers: {
               'Authorization': \`Bearer \${(await supabase.auth.getSession()).data.session?.access_token}\`
             }
          });
          if (!res.ok) throw new Error("Admin fetch failed");
          const data = await res.json();
          const items = data?.content || data?.data || data?.items || data;
          
          if (items && Array.isArray(items) && items.length > 0) {
             allNcpTxs = [...allNcpTxs, ...items];
             const totalCount = data?.totalElements || data?.totalCount || 0;
             if (totalCount > 0 && allNcpTxs.length < totalCount) {
                 currentPage++;
             } else {
                 keepFetching = false;
             }
          } else {
             keepFetching = false;
          }
        } catch (e) {
          console.warn("NCP Admin history fetch failed, falling back to Supabase.", e);
          keepFetching = false;
        }
      }

      if (allNcpTxs.length > 0) {
        const getCreditTypeDescription = (type: string, amount: number) => {
          const map: Record<string, string> = {
            CHARGE: '크레딧 충전',
            MEMBERSHIP_BONUS: '멤버십 가입 보너스',
            REFERRAL: '친구 추천 보상',
            SIGNUP: '신규 가입 보상',
            DAILY: '출석 보상',
            AI_FACE_SWAP: 'AI 얼굴 합성 사용',
            AI_FACE_SWAP_MEMBERSHIP: 'AI 얼굴 합성 (멤버십)',
            AI_VIDEO: 'AI 영상 생성 사용',
            AI_VIDEO_MEMBERSHIP: 'AI 영상 생성 (멤버십)',
            REFUND_AI_FACE_SWAP: 'AI 얼굴 합성 환불',
            REFUND_AI_FACE_SWAP_MEMBERSHIP: 'AI 얼굴 합성 환불 (멤버십)',
            REFUND_AI_VIDEO: 'AI 영상 생성 환불',
            REFUND_AI_VIDEO_MEMBERSHIP: 'AI 영상 생성 환불 (멤버십)',
            REVOKE_MEMBERSHIP_CREDIT: '멤버십 크레딧 회수'
          };
          return map[type] || (amount > 0 ? '크레딧 적립' : '크레딧 차감');
        };

        const mappedTxs = allNcpTxs.map((t: any) => ({
          id: t.id || t.pointHistoryId || Math.random().toString(),
          type: (t.amount > 0) ? 'earned' : 'deducted',
          amount: Math.abs(t.amount || t.point || 0),
          description: t.description || getCreditTypeDescription(t.type, t.amount),
          created_at: t.date || t.createdAt || new Date().toISOString()
        }));
        setUserHistory(mappedTxs);
      } else {
        // ... Supabase logic
        const { data, error } = await supabase
          .from("credit_transactions")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setUserHistory(data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setLoadingHistory(false);
    }
  };`;

fs.writeFileSync('fetchOld.txt', fetchOld, 'utf-8');
console.log('Saved to fetchOld.txt');
