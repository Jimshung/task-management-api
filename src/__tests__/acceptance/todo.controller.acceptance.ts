import { Client, expect } from '@loopback/testlab';
import { TodoAppApplication } from '../..';
import { setupApplication } from './test-helper';

describe('TodoController', () => {
  let app: TodoAppApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({ app, client } = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  it('創建待辦事項 - 成功', async () => {
    const res = await client.post('/todos').send({
      todo: {
        title: '測試外鍵關聯',
        status: 'ACTIVE',
      },
      items: [
        {
          content: '測試項目1',
          is_completed: false,
        },
        {
          content: '測試項目2',
          is_completed: false,
        },
      ],
    });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('id');
    expect(res.body.title).to.equal('測試外鍵關聯');
    expect(res.body.status).to.equal('ACTIVE');
    expect(res.body.items).to.have.length(2);
    expect(res.body.items[0].content).to.equal('測試項目1');
    expect(res.body.items[1].content).to.equal('測試項目2');
  });

  it('創建待辦事項 - 缺少標題應該失敗', async () => {
    const res = await client.post('/todos').send({
      todo: {
        status: 'ACTIVE',
      },
      items: [],
    });

    expect(res.status).to.equal(400);
    expect(res.body.code).to.equal('VALIDATION_ERROR');
  });

  it('創建待辦事項 - items 格式錯誤應該失敗', async () => {
    const res = await client.post('/todos').send({
      todo: {
        title: '測試標題',
        status: 'ACTIVE',
      },
      items: [
        {
          is_completed: false, // 缺少 content
        },
      ],
    });

    expect(res.status).to.equal(400);
    expect(res.body.code).to.equal('VALIDATION_ERROR');
  });
});
