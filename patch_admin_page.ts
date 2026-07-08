import fs from 'fs';

const filePath = 'src/pages/AdminPage.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Remove NCP history fetching from fetchDesignerDetail
content = content.replace(/let ncpTxs: any\[\] = \[\];\s+try \{\s+\/\/ Fetch credit history sync[\s\S]*?ncpTxs = allNcpTxs;\s+\} catch\(e\) \{ console\.log\('Credit fetch err'\); \}/g, 'let ncpTxs: any[] = [];');

// 2. Remove ncpCreditHistory from setSelectedDesignerDetail
content = content.replace(/ncpCreditHistory: ncpTxs,/g, '');

// 3. Make fetchUserHistory use Supabase directly
const fetchUserHistoryOld = `  const fetchUserHistory = async (userId: string, userName: string) => {
    setViewHistoryUserId(userId);
    setViewHistoryUserName(userName);
    setLoadingHistory(true);
    let ncpTxs: any[] = [];
    
    try {
      // Find user to map ncp_designer_id
      const profileInfo = profiles.find((p) => p.id === userId);
      const targetDesignerId = profileInfo?.ncp_designer_id || userId;
      
      let allNcpTxs: any[] = [];
      let currentPage = 1;
      let keepFetching = true;

      while (keepFetching) {
         try {
           const res = await apiClient.get('/faceswap/credit/history', { 
              params: { month: 12, filter: 'ALL', pageNo: currentPage, pageSize: 50, designerId: targetDesignerId } 
           });
           const items = res.data?.content || res.data?.data || res.data?.items || res.data;
           if (items && Array.isArray(items) && items.length > 0) {
              allNcpTxs = [...allNcpTxs, ...items];
              const totalCount = res.data?.totalElements || res.data?.totalCount || 0;
              if (totalCount > 0 && allNcpTxs.length < totalCount) {
                  currentPage++;
              } else {
                  keepFetching = false;
              }
           } else {
              keepFetching = false;
           }
         } catch (e1) {
           console.log("apiClient /faceswap/credit/history not hosted on core. Quietly attempting account server query.");
           const res = await accountClient.get('/faceswap/credit/history', { 
              params: { month: 12, filter: 'ALL', pageNo: currentPage, pageSize: 50, designerId: targetDesignerId } 
           });
           const items = res.data?.content || res.data?.data || res.data?.items || res.data;
           if (items && Array.isArray(items) && items.length > 0) {
              allNcpTxs = [...allNcpTxs, ...items];
              const totalCount = res.data?.totalElements || res.data?.totalCount || 0;
              if (totalCount > 0 && allNcpTxs.length < totalCount) {
                  currentPage++;
              } else {
                  keepFetching = false;
              }
           } else {
              keepFetching = false;
           }
         }
      }

      if (allNcpTxs.length > 0) {
        ncpTxs = allNcpTxs;
      }
    } catch (err) {
      console.log("NCP specialized credit history endpoints are not hosted. Seamlessly fall back to Supabase transactions.");
    }
    
    try {
      if (ncpTxs.length > 0) {
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

        const mappedTxs = ncpTxs.map((t: any) => ({
          id: t.id || t.pointHistoryId || Math.random().toString(),
          type: (t.amount > 0) ? 'earned' : 'deducted',
          amount: Math.abs(t.amount || t.point || 0),
          description: t.description || getCreditTypeDescription(t.type, t.amount),
          created_at: t.date || t.createdAt || new Date().toISOString()
        }));
        setUserHistory(mappedTxs);
      } else {
        // Fallback to Supabase if no NCP rows found
        const { data, error } = await supabase
          .from("credit_transactions")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setUserHistory(data || []);
      }
    } catch (err) {
      console.error("Error fetching user history:", err);
      // alert("이력 조회 중 오류가 발생했습니다.");
    } finally {
      setLoadingHistory(false);
    }
  };`;

const fetchUserHistoryNew = `  const fetchUserHistory = async (userId: string, userName: string) => {
    setViewHistoryUserId(userId);
    setViewHistoryUserName(userName);
    setLoadingHistory(true);
    
    try {
      console.log("[Admin] Fetching user history from Supabase credit_transactions...");
      const { data, error } = await supabase
        .from("credit_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setUserHistory(data || []);
    } catch (err) {
      console.error("Error fetching user history:", err);
      // alert("이력 조회 중 오류가 발생했습니다.");
      setUserHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };`;

content = content.replace(fetchUserHistoryOld, fetchUserHistoryNew);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Patched AdminPage.tsx');
