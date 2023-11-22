export const scopes = ['https://www.googleapis.com/auth/drive.readonly'];

const driveBaseURL = 'https://www.googleapis.com/drive/v3';

export class GoogleDriveApiError extends Error {
  constructor(
    message: string,
    public type: string,
    public status: number,
    public data: unknown
  ) {
    super(message);
  }
}

export async function fetchSpreadSheets(token: string): Promise<
  {
    id: string;
    name: string;
  }[]
> {
  const resp = await _fetch(
    `${driveBaseURL}/files?q=mimeType='application/vnd.google-apps.spreadsheet'`,
    token
  );

  const data = await resp.json();
  return data.files;
}

async function _fetch(url: string, token: string) {
  const resp = await fetch(url, {
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      Authorization: `Bearer ${token}`,
    },
  });

  if (resp.status !== 200) {
    let data;
    try {
      data = await resp.json();
    } catch (e) {
      console.error(e);
    }

    throw new GoogleDriveApiError(
      data?.error?.message || 'unknown api error',
      'status',
      resp.status,
      data
    );
  }

  return resp;
}
