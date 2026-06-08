export interface IpfsProvider {
  uploadImage(imageUrl: string): Promise<{ cid: string; gatewayUrl: string }>;
  uploadMetadata(metadata: Record<string, unknown>): Promise<{ cid: string; gatewayUrl: string }>;
}

class MockIpfsProvider implements IpfsProvider {
  async uploadImage(imageUrl: string) {
    return {
      cid: `mock-image-${Date.now()}`,
      gatewayUrl: imageUrl
    };
  }

  async uploadMetadata(metadata: Record<string, unknown>) {
    return {
      cid: `mock-meta-${Date.now()}`,
      gatewayUrl: `ipfs://mock/${encodeURIComponent(JSON.stringify(metadata))}`
    };
  }
}

export class IpfsService {
  private readonly provider: IpfsProvider = new MockIpfsProvider();

  uploadImage(imageUrl: string) {
    return this.provider.uploadImage(imageUrl);
  }

  uploadMetadata(metadata: Record<string, unknown>) {
    return this.provider.uploadMetadata(metadata);
  }
}
