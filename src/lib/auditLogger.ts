import { supabase } from '../supabase';

/**
 * Audit Logger Utility
 * 개인정보 취급 이력(조회, 다운로드, 수정, 삭제)을 안전하게 기록하기 위한 유틸리티입니다.
 */

export type PrivacyActionType = 'VIEW' | 'DOWNLOAD' | 'UPDATE' | 'DELETE' | 'EXPORT';
export type PrivacyTargetResource = 'profiles' | 'inquiries' | 'billing' | 'subscriptions' | 'cs_tickets';

export const logPrivacyAction = async (
  actionType: PrivacyActionType,
  targetResource: PrivacyTargetResource,
  targetId: string = 'ALL',
  details: Record<string, any> = {}
) => {
  try {
    // Call the securely defined RPC function to prevent spoofing of actor details
    const { data, error } = await supabase.rpc('log_privacy_action', {
      p_action_type: actionType,
      p_target_resource: targetResource,
      p_target_id: targetId,
      p_details: details,
    });

    if (error) {
      console.error('[AuditLogger] Failed to log privacy action:', error.message);
    }
  } catch (err) {
    console.error('[AuditLogger] Exception while logging privacy action:', err);
  }
};
