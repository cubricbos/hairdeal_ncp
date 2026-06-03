import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Supabase JS SDK automatically handles PKCE code exchange or parses hash tokens from URL
        const { data: { session }, error } = await supabase.auth.getSession();

        if (session) {
          setStatus("success");
          if (window.opener) {
            window.opener.postMessage(
              { type: "OAUTH_AUTH_SUCCESS", session },
              window.location.origin
            );
            // Give a tiny moment for postMessage to deliver before closing
            setTimeout(() => {
              window.close();
            }, 600);
          } else {
            // Fallback if not opened in a popup
            window.location.href = "/ai-hair-model";
          }
        } else if (error) {
          throw error;
        } else {
          // If no immediate session, subscribe to auth state changes to catch it
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, currentSession) => {
              if (currentSession) {
                setStatus("success");
                subscription.unsubscribe();
                if (window.opener) {
                  window.opener.postMessage(
                    { type: "OAUTH_AUTH_SUCCESS", session: currentSession },
                    window.location.origin
                  );
                  setTimeout(() => {
                    window.close();
                  }, 600);
                } else {
                  window.location.href = "/ai-hair-model";
                }
              }
            }
          );

          // Add a timeout fallback
          setTimeout(() => {
            subscription.unsubscribe();
            setStatus("error");
            setErrorMessage("인증 세션을 가져오는 데 시간이 너무 오래 걸립니다.");
            if (window.opener) {
              window.opener.postMessage(
                { type: "OAUTH_AUTH_ERROR", message: "Timeout waiting for session" },
                window.location.origin
              );
            }
          }, 6000);
        }
      } catch (err: any) {
        console.error("Auth callback handler failed:", err);
        setStatus("error");
        setErrorMessage(err.message || "로그인 처리 도중 에러가 발생했습니다.");
        if (window.opener) {
          window.opener.postMessage(
            { type: "OAUTH_AUTH_ERROR", message: err.message || "Unknown callback error" },
            window.location.origin
          );
        }
      }
    };

    processCallback();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center font-sans">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-md w-full flex flex-col items-center">
        {status === "loading" && (
          <>
            <div className="relative flex items-center justify-center mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-100 border-t-brand-primary"></div>
              <div className="absolute text-brand-primary font-bold text-xs">GO</div>
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">구글 로그인 처리 중</h2>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">
              안전하게 계정 정보를 연동하고 있습니다.<br />이 창은 로그인이 완료되면 자동으로 닫힙니다.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6 text-green-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">로그인 완료!</h2>
            <p className="text-gray-500 text-sm font-medium">
              인증이 정상적으로 완료되었습니다. 잠시 후 창이 닫힙니다.
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">로그인 실패</h2>
            <p className="text-red-500 text-sm font-bold mb-4">{errorMessage}</p>
            <button
              onClick={() => window.close()}
              className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl text-sm transition-all"
            >
              닫기
            </button>
          </>
        )}
      </div>
    </div>
  );
}
