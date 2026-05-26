import { supabase } from '../supabase';

export async function checkAndRewardReferralActivity(userId: string) {
  try {
    // Check if there is an uncompleted referral mission for this user
    const { data: mission } = await supabase
      .from('referral_missions')
      .select('id, referrer_id, status')
      .eq('referred_id', userId)
      .eq('status', 'signup')
      .single();

    if (!mission) return;

    // Get the reward amount
    let rewardAmount = 80;
    try {
      const { data: metrics } = await supabase.from('app_metrics').select('referral_activity_reward').eq('id', 1).single();
      if (metrics?.referral_activity_reward) rewardAmount = metrics.referral_activity_reward;
    } catch (e: any) {
      if (e?.message !== 'Failed to fetch' && e?.message !== 'FetchError') {
        console.error("Failed to fetch referral activity reward metrics", e);
      }
    }

    // Mark as completed
    await supabase.from('referral_missions').update({ 
      status: 'completed', 
      completed_at: new Date().toISOString() 
    }).eq('id', mission.id);

    // Reward referrer
    const { data: refUser } = await supabase.from('profiles').select('credits').eq('id', mission.referrer_id).single();
    if (refUser) {
      await supabase.from('profiles').update({ credits: refUser.credits + rewardAmount }).eq('id', mission.referrer_id);
      await supabase.from('credit_transactions').insert([{
        user_id: mission.referrer_id,
        type: 'earned',
        amount: rewardAmount,
        description: '친구 추천 퀘스트 완료 보상 (이미지 생성)'
      }]);
      // Optional: dispatch event if the referrer happens to be logged in the same browser, but generally they are not.
    }
  } catch (err) {
    console.error("Referral activity check failed:", err);
  }
}
