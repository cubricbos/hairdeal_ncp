import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Instagram, Link2, Settings, RefreshCw, Eye, MessageCircle, Heart, AlertCircle, CheckCircle2, Copy, Grid } from 'lucide-react';

interface IgAccount {
  igId: string;
  username: string;
  profileUrl: string;
  followers: number;
  mediaCount: number;
  accessToken: string;
}

interface IgMedia {
  id: string;
  caption?: string;
  media_url: string;
  media_type: string;
  like_count: number;
  comments_count: number;
  timestamp: string;
  thumbnail_url?: string;
  permalink?: string;
  shortcode?: string;
}

const InstagramPage: React.FC = () => {
  const [appId, setAppId] = useState(import.meta.env.VITE_FACEBOOK_APP_ID || '993865986398920');
  const [account, setAccount] = useState<IgAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<IgMedia[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => {
    if (account && account.accessToken) {
      fetchPosts(account);
    }
  }, [account]);

  const fetchPosts = async (acc: IgAccount) => {
    setLoadingPosts(true);
    try {
      const res = await fetch(`https://graph.facebook.com/v19.0/${acc.igId}/media?fields=id,caption,media_url,media_type,thumbnail_url,like_count,comments_count,timestamp,permalink,shortcode&access_token=${acc.accessToken}&limit=18`).catch(err => {
        if (err.message === 'Failed to fetch') {
          throw new Error('게시물 목록을 불러올 수 없습니다. 통신을 차단하는 광고차단기를 해제해주세요.');
        }
        throw err;
      });
      const data = await res.json();
      if (data.data) {
        setPosts(data.data);
      }
    } catch (err: any) {
      if (err?.message !== 'Failed to fetch' && err?.message !== 'FetchError') {
        console.error('Failed to fetch posts:', err);
      }
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    // Listen for popup messages
    const handleMessage = (event: MessageEvent) => {
      // Allow only messages from our own origin
      if (event.origin !== window.location.origin) {
        return;
      }
      
      // Check for our custom message type
      if (event.data?.type === 'IG_OAUTH_SUCCESS') {
        const hash = event.data.hash;
        const token = new URLSearchParams(hash.substring(1)).get('access_token');
        if (token) {
          setIsLoading(true);
          fetchInstagramAccount(token)
            .then(async (acc) => {
              setAccount(acc);
              localStorage.setItem('ig_account', JSON.stringify(acc));
              setIsLoading(false);
            })
            .catch(err => {
              console.error(err);
              setError(err.message || "인스타그램 비즈니스 계정을 찾을 수 없습니다.");
              setIsLoading(false);
            });
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    // Check local storage for existing session
    const saved = localStorage.getItem('ig_account');
    if (saved) {
      try {
        setAccount(JSON.parse(saved));
      } catch(e) {}
    }

    // Check if returning from OAuth
    const hash = window.location.hash;
    if (hash.includes('access_token=')) {
      if (window.opener) {
        // We are in the popup window! Send message to parent and close.
        window.opener.postMessage({ type: 'IG_OAUTH_SUCCESS', hash }, '*');
        window.close();
        return;
      }

      // Fallback if not opened in a popup
      const token = new URLSearchParams(hash.substring(1)).get('access_token');
      if (token) {
        setIsLoading(true);
        fetchInstagramAccount(token)
          .then(async (acc) => {
            setAccount(acc);
            localStorage.setItem('ig_account', JSON.stringify(acc));
            window.history.replaceState(null, '', window.location.pathname);
            setIsLoading(false);
          })
          .catch(err => {
            console.error(err);
            setError(err.message || "인스타그램 비즈니스 계정을 찾을 수 없습니다.");
            setIsLoading(false);
          });
      }
    }
  }, []);

  const fetchInstagramAccount = async (accessToken: string): Promise<IgAccount> => {
    // 1. Get User's Pages
    const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`).catch(err => {
      if (err.message === 'Failed to fetch') {
        throw new Error('네트워크 연결 오류: 페이스북 API 서버에 접근할 수 없습니다. 광고 차단기를 확인해주세요.');
      }
      throw err;
    });
    const pagesData = await pagesRes.json();
    
    if (pagesData.data && pagesData.data.length > 0) {
      // Find the first page with an associated IG account
      for (const page of pagesData.data) {
        const pageToken = page.access_token; // The page token gives us perm to see IG account
        const igRes = await fetch(`https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${pageToken}`).catch(err => {
          if (err.message === 'Failed to fetch') {
            throw new Error('네트워크 연결 오류: 페이스북 API 서버에 접근할 수 없습니다. 광고 차단기를 확인해주세요.');
          }
          throw err;
        });
        const igData = await igRes.json();
        
        if (igData.instagram_business_account) {
          const igId = igData.instagram_business_account.id;
          
          // Use user access token mapped to this IG ID
          const detailsRes = await fetch(`https://graph.facebook.com/v19.0/${igId}?fields=username,profile_picture_url,followers_count,media_count&access_token=${accessToken}`).catch(err => {
            if (err.message === 'Failed to fetch') {
              throw new Error('네트워크 연결 오류: 페이스북 API 서버에 접근할 수 없습니다. 광고 차단기를 확인해주세요.');
            }
            throw err;
          });
          const detailsData = await detailsRes.json();
          
          return { 
            igId, 
            username: detailsData.username, 
            profileUrl: detailsData.profile_picture_url || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=200&h=200&auto=format&fit=crop',
            followers: detailsData.followers_count || 0,
            mediaCount: detailsData.media_count || 0,
            accessToken // store the user token
          };
        }
      }
    }
    throw new Error("연결된 페이스북 페이지나 인스타그램 프로페셔널 계정이 없습니다. Meta Business Suite 설정을 확인하세요.");
  };

  const handleConnect = () => {
    if (!appId) {
      setError("VITE_FACEBOOK_APP_ID 설정이 필요합니다.");
      return;
    }
    // 명확하게 경로를 하드코딩하여 뒤에 슬래시(/) 등 미세한 차이로 인한 오류 방지
    const redirectUri = window.location.origin + '/mypage/instagram';
    const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&display=popup&extras={"setup":{"channel":"IG_API"}}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement`;
    
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    const popup = window.open(url, 'fb_oauth', `width=${width},height=${height},left=${left},top=${top}`);
    
    if (!popup) {
      setError("팝업창이 브라우저에 의해 차단되었습니다. 팝업 차단을 해제하고 다시 시도해주세요.");
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('ig_account');
    setAccount(null);
  };

  const getPostLink = (post: IgMedia, username: string) => {
    if (post.shortcode) {
      // 릴스(/reel/ 또는 /reels/)의 경우, 웹에서 링크 클릭 시 자동으로 다음 릴스로 넘어가거나 다른 릴스를 띄워버리는 문제 방지를 위해 /p/ 로 강제 연결
      return `https://www.instagram.com/p/${post.shortcode}/`;
    }
    if (post.permalink) {
      let url = post.permalink;
      if (url.includes('/reel/')) {
        url = url.replace('/reel/', '/p/');
      }
      if (url.includes('/reels/')) {
        url = url.replace('/reels/', '/p/');
      }
      return url;
    }
    return `https://www.instagram.com/${username}/`;
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">인스타그램 계정관리</h1>
          <p className="text-gray-500 font-medium tracking-tight">AI 결과물을 자동으로 포스팅하고 계정을 성장시키세요</p>
        </div>
        <button className="bg-gradient-to-tr from-purple-600 via-pink-600 to-orange-500 text-white p-3 rounded-2xl shadow-lg hover:scale-105 transition-transform active:scale-95">
          <Instagram className="w-6 h-6" />
        </button>
      </div>

      {isLoading && (
        <div className="text-center py-20 text-gray-500 font-bold">인증 처리 중입니다...</div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl font-medium mb-8 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {account && !isLoading ? (
        <>
          {/* Connection Card */}
          <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm mb-10 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                  <div className="w-full h-full rounded-full border-4 border-white bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img src={account.profileUrl || undefined} alt="Insta" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black text-gray-900 mb-1">@{account.username}</h3>
                  <p className="text-sm font-bold text-emerald-500 flex items-center justify-center md:justify-start gap-1">
                    <CheckCircle2 className="w-4 h-4" /> 연동 완료 (자동 업로드 활성화)
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleDisconnect} className="px-6 py-3 bg-gray-50 text-gray-600 rounded-xl font-bold border border-gray-100 hover:bg-gray-100 transition-colors">
                    연동 해제
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-gray-50">
                <div className="text-center">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Posts</p>
                  <p className="text-xl font-black text-gray-900">{account.mediaCount}</p>
                </div>
                <div className="text-center border-x border-gray-50 px-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Followers</p>
                  <p className="text-xl font-black text-gray-900">{account.followers}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Following</p>
                  <p className="text-xl font-black text-gray-900">-</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Posts Grid */}
          <div className="mt-12">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <Grid className="w-5 h-5" /> 업로드된 게시물
            </h3>
            
            {loadingPosts ? (
              <div className="flex justify-center p-12">
                <RefreshCw className="w-8 h-8 text-gray-300 animate-spin" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-gray-500 font-medium">아직 자동 업로드된 게시물이 없습니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1 md:gap-4 max-w-sm mx-auto md:max-w-none md:mx-0">
                <AnimatePresence>
                  {posts.map((post) => (
                    <motion.div 
                      key={post.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="group relative aspect-square bg-gray-100 overflow-hidden md:rounded-xl"
                    >
                      {post.media_type === 'VIDEO' ? (
                        <img src={post.thumbnail_url || post.media_url || undefined} alt="Post" className="w-full h-full object-cover" />
                      ) : (
                        <img src={post.media_url || undefined} alt="Post" className="w-full h-full object-cover" />
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 text-white p-4">
                        <div className="flex gap-4 font-bold text-sm">
                          <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 fill-white" /> {post.like_count}</span>
                          <span className="flex items-center gap-1.5"><MessageCircle className="w-4 h-4 fill-white" /> {post.comments_count}</span>
                        </div>
                        
                        <div className="flex gap-2">
                           <a 
                             href={getPostLink(post, account.username)} 
                             target="_blank" 
                             rel="noreferrer"
                             className="p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors backdrop-blur-sm"
                           >
                              <Eye className="w-4 h-4" />
                           </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </>
      ) : !isLoading && (
        <div className="bg-white rounded-[32px] border border-gray-100 p-8 md:p-12 shadow-sm mb-10 overflow-hidden relative leading-relaxed">
          <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Link2 className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3">인스타그램 연동이 필요합니다</h2>
            <p className="text-gray-500 font-medium mb-10 leading-relaxed">
              작업하신 결과물을 버튼 한 번으로 Instagram 피드에 등록하려면, 먼저 권한 연동이 필요합니다. 
              아래의 절차에 따라 Meta Developer 설정을 완료해주세요.
            </p>

            <button onClick={handleConnect} disabled={!appId} className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold hover:scale-105 transition-all text-lg mb-4 disabled:opacity-50">
              Instagram 계정 연동하기
            </button>
            {!appId && <p className="text-sm text-red-500 font-medium">.env 파일에 VITE_FACEBOOK_APP_ID 를 설정해주세요.</p>}
          </div>

          <div className="mt-16 bg-gray-50 rounded-2xl p-6 md:p-10 text-left border border-gray-100">
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-600" /> 외부 설정 안내 (Meta Developer)
            </h3>
            
            <ol className="space-y-6">
              <li className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">1</div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Instagram 계정 전환</h4>
                  <p className="text-sm text-gray-600">업로드할 Instagram 계정을 <span className="font-semibold text-gray-900">프로페셔널(크리에이터/비즈니스) 계정</span>으로 전환하세요. 설정 &gt; 비즈니스 도구 및 관리자 &gt; 프로페셔널 계정으로 전환.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">2</div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Facebook 페이지 연동</h4>
                  <p className="text-sm text-gray-600">Instagram 프로필 편집에서 '페이지' 항목을 탭하여 <span className="font-semibold text-gray-900">Facebook 페이지와 연결</span>합니다. (페이지가 없다면 생성해야 합니다)</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">3</div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Meta Developer App 생성</h4>
                  <p className="text-sm text-gray-600">
                    <a href="https://developers.facebook.com/" target="_blank" rel="noreferrer" className="text-brand-primary hover:underline">Meta for Developers</a> 에 로그인 후, [내 앱] - [앱 만들기]에서 
                    유형을 '비즈니스 관리'로 선택하세요.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">4</div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Instagram Graph API 설정</h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>앱의 대시보드에서 다음 순서대로 설정하세요:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>왼쪽 사이드바 하단의 <strong>[제품 추가]</strong> (또는 사용 사례 추가) 클릭</li>
                      <li><strong>[Facebook 로그인]</strong> (또는 비즈니스용 Facebook 로그인) 제품의 <strong>[설정]</strong> 클릭</li>
                      <li>왼쪽 메뉴에서 생성된 [Facebook 로그인] 하위의 <strong>[설정]</strong> 메뉴 클릭</li>
                      <li>'클라이언트 OAuth 설정' 섹션에서 <strong>유효한 OAuth 리디렉션 URI</strong> 입력란 찾기</li>
                      <li>입력란에 아래 주소를 정확히 복사하여 붙여넣고 [변경 사항 저장] 클릭:
                        <div className="text-xs text-orange-600 mt-1 mb-1 font-bold">
                          💡 아래 주소는 현재 접속중인 도메인({window.location.origin})에 맞춰 자동으로 생성된 주소입니다. Vercel 등 다른 도메인으로 배포시 해당 도메인에 맞춰 자동으로 변경됩니다. 모두 Meta 개발자 센터에 추가해주세요.
                        </div>
                        <div className="flex flex-col gap-2 mt-2">
                           <code className="block bg-gray-200 px-3 py-2 rounded text-pink-600 break-all w-full font-mono text-sm border border-gray-300">
                             {window.location.origin}/mypage/instagram
                           </code>
                           <button 
                             onClick={() => {
                               navigator.clipboard.writeText(`${window.location.origin}/mypage/instagram`);
                               alert('리디렉션 URI가 복사되었습니다. 정확히 붙여넣기 해주세요.');
                             }}
                             className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-900 text-white rounded text-sm font-bold hover:bg-black transition-colors w-fit"
                           >
                             <Copy className="w-4 h-4" /> 주소 복사하기
                           </button>
                        </div>
                        <p className="text-xs text-red-500 font-bold mt-2">※ 주의: URL 맨 뒤에 슬래시(/)가 붙거나 철자가 1글자라도 다르면 '차단된 URL' 오류가 발생합니다. 반드시 위 [주소 복사하기] 버튼을 눌러 정확히 붙여넣어주세요!</p>
                        <p className="text-xs text-gray-500 mt-1">※ '클라이언트 OAuth 로그인'과 '웹 OAuth 로그인' 스위치가 모두 '예'로 켜져있는지 확인하세요.</p>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">5</div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">App ID 환경변수 설정</h4>
                  <p className="text-sm text-gray-600">발급받은 '앱 ID'를 환경변수에 등록하세요.</p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstagramPage;

