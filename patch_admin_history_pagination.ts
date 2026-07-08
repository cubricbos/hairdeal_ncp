import fs from 'fs';

const filePath = 'src/pages/AdminPage.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const stateOld = 'const [userHistory, setUserHistory] = useState<any[]>([]);';
const stateNew = `const [userHistory, setUserHistory] = useState<any[]>([]);
  const [userHistoryPage, setUserHistoryPage] = useState(1);
  const [userHistoryHasMore, setUserHistoryHasMore] = useState(true);
  const [userHistoryLoadingMore, setUserHistoryLoadingMore] = useState(false);
  const [userHistoryStats, setUserHistoryStats] = useState({ total: 0, friend: 0, monthUsed: 0, loading: false });`;

content = content.replace(stateOld, stateNew);

const getCreditTypeDescription = `        const getCreditTypeDescription = (type: string, amount: number) => {
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
        };`;

const fetchHistoryOldRegex = /const fetchUserHistory = async \([\s\S]*?setUserHistory\(\[\]\);\s*\}\s*finally\s*\{\s*setLoadingHistory\(false\);\s*\}\s*\};/m;

const fetchHistoryNew = `const fetchUserHistory = async (userId: string, userName: string, totalCredits: number = 0) => {
    setViewHistoryUserId(userId);
    setViewHistoryUserName(userName);
    setLoadingHistory(true);
    setUserHistoryPage(1);
    setUserHistoryHasMore(true);
    setUserHistory([]);
    setUserHistoryStats({ total: totalCredits, friend: 0, monthUsed: 0, loading: true });

    try {
      const profileInfo = profiles.find((p) => p.id === userId);
      const targetDesignerId = profileInfo?.ncp_account_id || profileInfo?.accountId || profileInfo?.ncp_designer_id || userId;

      // 1. Fetch first page of NCP
      const res = await fetch(\`/api/admin/user-credit-history?designerId=\${targetDesignerId}&pageNo=1&pageSize=10&month=12\`, {
         headers: {
           'Authorization': \`Bearer \${(await supabase.auth.getSession()).data.session?.access_token}\`
         }
      });
      
      let initialTxs: any[] = [];
      let totalCount = 0;

      if (res.ok) {
        const data = await res.json();
        const items = data?.content || data?.data || data?.items || data;
        if (items && Array.isArray(items)) {
          initialTxs = items;
          totalCount = data?.totalElements || data?.totalCount || 0;
        }
      }

${getCreditTypeDescription}

      if (initialTxs.length > 0) {
        const mappedTxs = initialTxs.map((t: any) => ({
          id: t.id || t.pointHistoryId || Math.random().toString(),
          type: (t.amount > 0) ? 'earned' : 'deducted',
          _originalType: t.type,
          amount: Math.abs(t.amount || t.point || 0),
          description: t.description || getCreditTypeDescription(t.type, t.amount),
          created_at: t.date || t.createdAt || new Date().toISOString()
        }));
        setUserHistory(mappedTxs);
        setUserHistoryHasMore(initialTxs.length < totalCount);
      } else {
        // Fallback to Supabase
        const { data, error } = await supabase
          .from("credit_transactions")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(10);
        if (!error && data) {
          setUserHistory(data);
          setUserHistoryHasMore(data.length === 10);
        } else {
          setUserHistoryHasMore(false);
        }
      }

      // Background task to compute stats
      (async () => {
        try {
          let allTxs: any[] = [];
          const MAX_PAGES = 5; // Fetch up to 250 items to estimate month usage and friends (or full if we want)
          let keepFetching = true;
          let p = 1;
          while(keepFetching && p <= MAX_PAGES) {
            const r = await fetch(\`/api/admin/user-credit-history?designerId=\${targetDesignerId}&pageNo=\${p}&pageSize=50&month=12\`, {
               headers: {
                 'Authorization': \`Bearer \${(await supabase.auth.getSession()).data.session?.access_token}\`
               }
            });
            if (!r.ok) break;
            const d = await r.json();
            const items = d?.content || d?.data || d?.items || d;
            if (items && Array.isArray(items) && items.length > 0) {
              allTxs = [...allTxs, ...items];
              if (allTxs.length >= (d?.totalElements || d?.totalCount || 0)) {
                keepFetching = false;
              } else {
                p++;
              }
            } else {
              keepFetching = false;
            }
          }
          
          let monthUsed = 0;
          let friend = 0;
          const now = new Date();
          const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

          allTxs.forEach(t => {
            const tDate = new Date(t.date || t.createdAt);
            if (t.amount < 0 && tDate >= firstDayOfMonth) {
              monthUsed += Math.abs(t.amount);
            }
            if (t.type === 'REFERRAL') {
              friend += Math.abs(t.amount);
            }
          });

          // Also check supabase for referrals if not enough in NCP
          const { data: dbRef } = await supabase.from('credit_transactions').select('amount').eq('user_id', userId).eq('type', 'earned').ilike('description', '%친구%');
          const dbFriend = dbRef?.reduce((sum, r) => sum + r.amount, 0) || 0;
          
          setUserHistoryStats({
            total: totalCredits,
            friend: Math.max(friend, dbFriend),
            monthUsed: monthUsed,
            loading: false
          });
        } catch (e) {
          console.warn("Background stats fetch failed", e);
          setUserHistoryStats(prev => ({ ...prev, loading: false }));
        }
      })();

    } catch (err) {
      console.error("Error fetching user history:", err);
      setUserHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadMoreUserHistory = async () => {
    if (userHistoryLoadingMore || !userHistoryHasMore || !viewHistoryUserId) return;
    setUserHistoryLoadingMore(true);
    try {
      const nextPage = userHistoryPage + 1;
      const profileInfo = profiles.find((p) => p.id === viewHistoryUserId);
      const targetDesignerId = profileInfo?.ncp_account_id || profileInfo?.accountId || profileInfo?.ncp_designer_id || viewHistoryUserId;

      const res = await fetch(\`/api/admin/user-credit-history?designerId=\${targetDesignerId}&pageNo=\${nextPage}&pageSize=10&month=12\`, {
         headers: {
           'Authorization': \`Bearer \${(await supabase.auth.getSession()).data.session?.access_token}\`
         }
      });
      if (res.ok) {
        const data = await res.json();
        const items = data?.content || data?.data || data?.items || data;
        
${getCreditTypeDescription}

        if (items && Array.isArray(items) && items.length > 0) {
          const mappedTxs = items.map((t: any) => ({
            id: t.id || t.pointHistoryId || Math.random().toString(),
            type: (t.amount > 0) ? 'earned' : 'deducted',
            _originalType: t.type,
            amount: Math.abs(t.amount || t.point || 0),
            description: t.description || getCreditTypeDescription(t.type, t.amount),
            created_at: t.date || t.createdAt || new Date().toISOString()
          }));
          setUserHistory(prev => [...prev, ...mappedTxs]);
          setUserHistoryPage(nextPage);
          
          const totalCount = data?.totalElements || data?.totalCount || 0;
          setUserHistoryHasMore((userHistory.length + items.length) < totalCount);
        } else {
          setUserHistoryHasMore(false);
        }
      } else {
        // Fallback Supabase load more
        const { data, error } = await supabase
          .from("credit_transactions")
          .select("*")
          .eq("user_id", viewHistoryUserId)
          .order("created_at", { ascending: false })
          .range(userHistory.length, userHistory.length + 9);
        if (!error && data && data.length > 0) {
          setUserHistory(prev => [...prev, ...data]);
          setUserHistoryPage(nextPage);
          setUserHistoryHasMore(data.length === 10);
        } else {
          setUserHistoryHasMore(false);
        }
      }
    } catch (e) {
      console.error("Failed to load more history", e);
    } finally {
      setUserHistoryLoadingMore(false);
    }
  };`;

content = content.replace(fetchHistoryOldRegex, fetchHistoryNew);

// UI Update
const modalOld = `<div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {viewHistoryUserName}님의 이용 내역
                  </h2>
                  <p className="text-xs text-gray-400 font-medium">{viewHistoryUserId}</p>
                </div>
                <button
                  onClick={() => setViewHistoryUserId(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">`;

const modalNew = `<div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {viewHistoryUserName}님의 이용 내역
                  </h2>
                  <p className="text-xs text-gray-400 font-medium">{viewHistoryUserId}</p>
                </div>
                <button
                  onClick={() => setViewHistoryUserId(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 flex flex-col">
                <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden mb-6 shrink-0">
                  <div className="flex flex-col md:flex-row md:items-end justify-between relative z-10">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Coins className="w-5 h-5 text-indigo-300" />
                        <h2 className="text-lg font-bold text-indigo-100">총 보유 크레딧</h2>
                      </div>
                      <p className="text-5xl font-black tracking-tight">{userHistoryStats.total.toLocaleString()} <span className="text-xl font-medium text-indigo-200 tracking-normal">C</span></p>
                    </div>
                    
                    <div className="flex gap-4 sm:gap-8 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t border-indigo-700/50 md:border-none">
                      <div className="flex-1 md:flex-none">
                        <h3 className="text-indigo-200 text-sm font-medium mb-1">친구 누적 크레딧</h3>
                        {userHistoryStats.loading ? (
                          <div className="h-6 w-20 bg-white/10 animate-pulse rounded-lg mt-1"></div>
                        ) : (
                          <div className="text-2xl font-bold">{userHistoryStats.friend.toLocaleString()} <span className="text-sm font-medium text-indigo-200">C</span></div>
                        )}
                      </div>
                      <div className="w-px bg-indigo-700/50 hidden md:block"></div>
                      <div className="flex-1 md:flex-none">
                        <h3 className="text-indigo-200 text-sm font-medium mb-1">이달 사용 크레딧</h3>
                        {userHistoryStats.loading ? (
                          <div className="h-6 w-20 bg-white/10 animate-pulse rounded-lg mt-1"></div>
                        ) : (
                          <div className="text-2xl font-bold">{userHistoryStats.monthUsed.toLocaleString()} <span className="text-sm font-medium text-indigo-200">C</span></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>`;

content = content.replace(modalOld, modalNew);

const listEndOld = `                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>`;

const listEndNew = `                      </div>
                    ))}
                    {userHistoryHasMore && (
                      <div className="py-4 flex justify-center">
                        <button
                          onClick={loadMoreUserHistory}
                          disabled={userHistoryLoadingMore}
                          className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
                        >
                          {userHistoryLoadingMore ? (
                            <>
                              <Activity className="w-4 h-4 animate-spin" />
                              불러오는 중...
                            </>
                          ) : (
                            '더 보기'
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>`;

content = content.replace(listEndOld, listEndNew);

// Replace the fetchUserHistory call site in the table
const callSiteOld = `onClick={() =>
                                    fetchUserHistory(
                                      profile.id,
                                      profile.full_name || profile.email,
                                    )
                                  }`;

const callSiteNew = `onClick={() =>
                                    fetchUserHistory(
                                      profile.id,
                                      profile.full_name || profile.email,
                                      profile.credits
                                    )
                                  }`;

content = content.replace(callSiteOld, callSiteNew);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Patched pagination and stats');
