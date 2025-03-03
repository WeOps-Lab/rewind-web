import useApiClient from '@/utils/request';
export const useChannelApi = () => {
  const { get, post, patch, del } = useApiClient();

  async function getChannelData() {
    return await get('/channel_mgmt/channel/');
  }

  async function getChannelDetail(id: string) {
    return await get(`/channel_mgmt/channel/${id}`);
  }

  async function addChannel(params: any) {
    return await post('/channel_mgmt/channel/', params);
  }

  async function updateChannel(params: any) {
    return await patch(`/channel_mgmt/channel/${params.id}/`, params);
  }

  async function updateChannelSettings(params: any) {
    return await post(`/channel_mgmt/channel/${params.id}/update_settings/`, params);
  }

  async function deleteChannel(params: any) {
    return await del(`/channel_mgmt/channel/${params.id}/`);
  }

  async function getChannelTemp(params: any) {
    return await get("/channel_mgmt/channel_template/", { params });
  }

  return {
    getChannelData,
    getChannelDetail,
    addChannel,
    updateChannel,
    updateChannelSettings,
    deleteChannel,
    getChannelTemp,
  }
}
