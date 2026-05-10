// src/services/capsule.service.ts

import api from '@/lib/axios';
import {
  CapsuleBase,
  CapsuleDetail,
  MonthlyTimelineResponse,
  InvitationResponse,
  MessageResponse,
  CheckInResponse,
  CapsuleCalendarResponse,
  CapsuleCheckInStatusResponse, 
} from '@/types/capsule';

export const capsuleService = {
  // 1. 생성 및 작성
  create: async (payload: any): Promise<CapsuleBase> => {
    const res = await api.post('/capsule/create', payload);
    return res.data;
  },

  addContent: async (id: string, formData: FormData): Promise<MessageResponse> => {
    const res = await api.post(`/capsule/${id}/content`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  lock: async (id: string, latitude: number, longitude: number): Promise<MessageResponse> => {
    const res = await api.post(`/capsule/${id}/lock`, { latitude, longitude });
    return res.data;
  },

  // 2. 조회 및 리스트
  getMap: async (): Promise<CapsuleBase[]> => {
    const res = await api.get('/capsule/map');
    return res.data;
  },

  getTimeline: async (params: { sort?: string; status?: string }): Promise<MonthlyTimelineResponse[]> => {
    const res = await api.get('/capsule/timeline-v2', { params });
    return res.data;
  },

  getCalendar: async (year: number, month: number): Promise<CapsuleCalendarResponse[]> => {
    const res = await api.get('/capsule/calendar', { params: { year, month } });
    return res.data;
  },

  getDetail: async (id: string): Promise<CapsuleDetail> => {
    const res = await api.get(`/capsule/${id}`);
    return res.data;
  },

  // 3. 초대 관리
  getInvitations: async (): Promise<InvitationResponse[]> => {
    const res = await api.get('/capsule/invitations');
    return res.data;
  },

  respondInvitation: async (participantId: number, accept: boolean): Promise<MessageResponse> => {
    const res = await api.post(`/capsule/invitations/${participantId}/respond`, { accept });
    return res.data;
  },

  // 4. 개봉 및 체크인 (여기로 통합!)
  checkIn: async (id: string, latitude: number, longitude: number): Promise<CheckInResponse> => {
    const res = await api.post(`/capsule/${id}/check-in`, { latitude, longitude });
    return res.data;
  },

  getCheckInStatus: async (id: string): Promise<CapsuleCheckInStatusResponse> => {
    const res = await api.get(`/capsule/${id}/check-in-status`);
    return res.data;
  },

  openCapsule: async (id: string): Promise<MessageResponse> => {
    const res = await api.post(`/capsule/${id}/open`);
    return res.data;
  },

  // 5. 삭제
  delete: async (id: string): Promise<MessageResponse> => {
    const res = await api.delete(`/capsule/${id}`);
    return res.data;
  },
};