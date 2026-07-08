import fs from 'fs';

const filePath = 'src/pages/AdminPage.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add state for designer credit history
const stateInsertion = `  const [designerCreditHistory, setDesignerCreditHistory] = useState<any[]>([]);
  const [loadingDesignerCreditHistory, setLoadingDesignerCreditHistory] = useState(false);`;

content = content.replace(/const \[userHistory, setUserHistory\] = useState<any\[\]>\(\[\]\);/, "const [userHistory, setUserHistory] = useState<any[]>([]);\n" + stateInsertion);

// 2. Fetch history in fetchDesignerDetail
const fetchDesignerDetailOld = `  const fetchDesignerDetail = async (profile: any) => {
    setFetchingDesignerDetail(true);
    setSelectedDesignerDetail(null);
    const profileId = profile.id;
    let ncpTxs: any[] = [];
    try {
      // Use core admin designer detail API instead of accountClient
      const { data } = await apiClient.get('/admin/designer', {
        params: { designerId: profileId }
      });
      // NCP list gives us 'credit', but detail object doesn't, so we merge
      setSelectedDesignerDetail({ 
         ...profile, 
         ...data, 
         provider: profile.provider || data.provider || data.signedBy || data.loginType || data.snsType || null,
        email: profile.email || data.email || null,
        mobileNumber: profile.mobileNumber || data.mobileNumber || null,
        career: null,
        introduce: data.introduce || data.introduction || null, 
        
        supaProfile: profile 
      });
    } catch (err: any) {`;

const fetchDesignerDetailNew = `  const fetchDesignerDetail = async (profile: any) => {
    setFetchingDesignerDetail(true);
    setSelectedDesignerDetail(null);
    setDesignerCreditHistory([]);
    setLoadingDesignerCreditHistory(true);

    const profileId = profile.id;
    const targetDesignerId = profile.ncp_designer_id || profileId;

    // Fetch credit history for this designer
    let fetchedHistory: any[] = [];
    try {
      let currentPage = 1;
      let keepFetching = true;

      while (keepFetching) {
        try {
          const res = await fetch(\`/api/admin/user-credit-history?designerId=\${targetDesignerId}&pageNo=\${currentPage}&pageSize=50&month=12\`, {
             headers: {
               'Authorization': \`Bearer \${(await supabase.auth.getSession()).data.session?.access_token}\`
             }
          });
          if (!res.ok) throw new Error("Admin fetch failed");
          const data = await res.json();
          const items = data?.content || data?.data || data?.items || data;
          
          if (items && Array.isArray(items) && items.length > 0) {
             fetchedHistory = [...fetchedHistory, ...items];
             const totalCount = data?.totalElements || data?.totalCount || 0;
             if (totalCount > 0 && fetchedHistory.length < totalCount) {
                 currentPage++;
             } else {
                 keepFetching = false;
             }
          } else {
             keepFetching = false;
          }
        } catch (e) {
          keepFetching = false;
        }
      }

      if (fetchedHistory.length > 0) {
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

        const mappedTxs = fetchedHistory.map((t: any) => ({
          id: t.id || t.pointHistoryId || Math.random().toString(),
          type: (t.amount > 0) ? 'earned' : 'deducted',
          amount: Math.abs(t.amount || t.point || 0),
          description: t.description || getCreditTypeDescription(t.type, t.amount),
          created_at: t.date || t.createdAt || new Date().toISOString()
        }));
        setDesignerCreditHistory(mappedTxs);
      } else {
        const { data, error } = await supabase
          .from("credit_transactions")
          .select("*")
          .eq("user_id", profileId)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setDesignerCreditHistory(data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch history for detail modal", err);
    } finally {
      setLoadingDesignerCreditHistory(false);
    }

    try {
      // Use core admin designer detail API instead of accountClient
      const { data } = await apiClient.get('/admin/designer', {
        params: { designerId: profileId }
      });
      // NCP list gives us 'credit', but detail object doesn't, so we merge
      setSelectedDesignerDetail({ 
         ...profile, 
         ...data, 
         provider: profile.provider || data.provider || data.signedBy || data.loginType || data.snsType || null,
        email: profile.email || data.email || null,
        mobileNumber: profile.mobileNumber || data.mobileNumber || null,
        career: null,
        introduce: data.introduce || data.introduction || null, 
        
        supaProfile: profile 
      });
    } catch (err: any) {`;

content = content.replace(fetchDesignerDetailOld, fetchDesignerDetailNew);

// 3. Replace the "약관 동의" section with credit history
const uiOld = `                         <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">약관 동의</h3>
                         <div className="space-y-3">
                             <div className="text-xs text-gray-500 text-center py-4 bg-gray-50 rounded-xl border border-gray-100">
                               관리자 API에서 세부 약관 동의 내역을 제공하지 않습니다.
                             </div>
                         </div>`;

const uiNew = `                         <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">이용 내역</h3>
                         <div className="space-y-3">
                             {loadingDesignerCreditHistory ? (
                               <div className="flex justify-center items-center py-6 bg-gray-50 rounded-xl border border-gray-100">
                                 <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                               </div>
                             ) : designerCreditHistory.length === 0 ? (
                               <div className="text-xs text-gray-500 text-center py-4 bg-gray-50 rounded-xl border border-gray-100">
                                 이용 내역이 없습니다.
                               </div>
                             ) : (
                               <div className="bg-white rounded-xl border border-gray-100 max-h-[200px] overflow-y-auto">
                                 {designerCreditHistory.map((t) => (
                                   <div key={t.id} className="flex justify-between items-center p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                     <div>
                                       <p className="text-sm font-medium text-gray-900">{t.description}</p>
                                       <p className="text-xs text-gray-500">{new Date(t.created_at).toLocaleString('ko-KR')}</p>
                                     </div>
                                     <div className={\`text-sm font-bold \${t.type === 'earned' ? 'text-indigo-600' : 'text-red-500'}\`}>
                                       {t.type === 'earned' ? '+' : '-'}{t.amount} CR
                                     </div>
                                   </div>
                                 ))}
                               </div>
                             )}
                         </div>`;

content = content.replace(uiOld, uiNew);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Patched AdminPage.tsx with credit history in modal.');
