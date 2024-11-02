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
        title: '測試待辦事項',
        subtitle: '測試副標題',
        status: 'ACTIVE',
      },
      items: [
        {
          content: '測試項目1',
          is_completed: false,
        },
      ],
    });

    expect(res.status).to.equal(200);
    expect(res.body.title).to.equal('測試待辦事項');
    expect(res.body.items).to.have.length(1);
  });
});
