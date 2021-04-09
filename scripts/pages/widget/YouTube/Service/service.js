const { cacheRequest } = require('../../../../utils/index');
const baseApi = 'https://www.googleapis.com/youtube/v3';
class Service {
  constructor(key, id) {
    this.key = key;
    this.id = id;
  }

  channel = {};
  videos = {};

  fetch = async () => {
    // 频道信息
    const channels = await this.getYoutubeData('channels', {
      part: 'snippet,statistics',
      key: this.key,
      id: this.id,
    });
    this.channel = channels.items[0];
    // // 频道模块信息
    // await this.getYoutubeData('channelSections', { part: 'contentDetails' });

    // 频道最新信息
    const activities = await this.getYoutubeData('activities', {
      part: 'contentDetails',
      channelId: this.id,
      key: this.key,
    });
    const videoItems = activities.items || [];
    const id = videoItems
      .map((item) => item.contentDetails.upload.videoId)
      .join(',');

    // 频道最新视频
    this.videos = await this.getYoutubeData('videos', {
      part: 'snippet',
      id,
      key: this.key,
    });
  };

  async getYoutubeData(key, paramter) {
    try {
      const data = { ...paramter };
      const params = Object.keys(data).map((key) => `${key}=${data[key]}`);
      const url = `${baseApi}/${key}?${params.join('&')}`;
      let response;
      if ($device.networkType) response = await $http.get({ url, timeout: 2 });
      response = cacheRequest(
        `youtube_${key}_${this.id}_${params.join('&')}`,
        response,
      );
      return response.data;
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = Service;
