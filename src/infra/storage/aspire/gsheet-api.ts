export const scopes = ['https://www.googleapis.com/auth/spreadsheets'];

const sheetsBaseURL = 'https://sheets.googleapis.com/v4/spreadsheets';

const dayInMs = 24 * 60 * 60 * 1000;
const sheetStartDate = Date.UTC(1899, 11, 30, 0, 0, 0, 0);

export class GoogleSheetsApiError extends Error {
  constructor(
    message: string,
    public type: string,
    public status: number,
    public data: unknown
  ) {
    super(message);
  }
}

export async function verifySpreadSheet(token: string, spreadsheetId: string) {
  const resp = await fetch(
    `${sheetsBaseURL}/${spreadsheetId}/values/BackendData!2:2`,
    {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await resp.json();
  if (!data || !data.values || !data.values.length) {
    return false;
  }

  const version = data.values[0][data.values[0].length - 1];
  return version === '3.2.0' || version === '3.3.0';
}

export class GoogleSheetsApi {
  protected token: string;
  protected spreadsheetId: string;

  constructor(token: string, spreadsheetId: string) {
    this.token = token;
    this.spreadsheetId = spreadsheetId;
  }

  setToken(token: string) {
    this.token = token;
  }

  setSpreadsheetId(spreadsheetId: string) {
    this.spreadsheetId = spreadsheetId;
  }

  protected async fetchValues(sheetId: string, range: string) {
    const url = `/values/${sheetId}${range}?valueRenderOption=UNFORMATTED_VALUE`;
    const resp = await this.fetch(url);
    const data = await resp.json();
    return data.values;
  }

  protected async fetch(url: string, params?: RequestInit) {
    const resp = await fetch(`${sheetsBaseURL}/${this.spreadsheetId}${url}`, {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        Authorization: `Bearer ${this.token}`,
      },
      ...params,
    });

    if (resp.status !== 200) {
      let data;
      try {
        data = await resp.json();
      } catch (e) {
        console.error(e);
      }

      throw new GoogleSheetsApiError(
        data?.error?.message || 'unknown api error',
        'status',
        resp.status,
        data
      );
    }

    return resp;
  }

  protected serialNumberToDate(serialNumber: number): Date {
    return new Date(
      serialNumber * dayInMs +
        sheetStartDate +
        new Date().getTimezoneOffset() * 60 * 1000
    );
  }

  // Google Sheets stores dates as number of days since December 30th 1899
  // for now assume timezone in the sheet & on the client is the same
  protected dateToSerialNumber(input: Date): number {
    // drop time part
    const d = new Date(input);
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);
    // apply timezone
    const unixTime = d.getTime() - d.getTimezoneOffset() * 60 * 1000;
    // unix time (since 1970) convert to days & add difference with December 30th 1899
    const serialNumber = unixTime / dayInMs + 25567 + 2;
    return serialNumber;
  }
}
