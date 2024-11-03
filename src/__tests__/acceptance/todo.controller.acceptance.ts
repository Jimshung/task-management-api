import {Client, expect} from '@loopback/testlab';
import {TodoAppApplication} from '../..';
import {TodoRepository} from '../../repositories';
import {setupApplication} from './test-helper';

describe('TodoController', () => {
  let app: TodoAppApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({ app, client } = await setupApplication());
  });

  beforeEach(async () => {
    // 清理測試數據
    const todoRepo = await app.getRepository(TodoRepository);
    await todoRepo.deleteAll();
  });

  after(async () => {
    await app.stop();
  });

  it('創建待辦事項 - 成功', async () => {
    const res = await client
      .post('/todos')
      .send({
        todo: {
          title: '測試外鍵關聯',
          status: 'ACTIVE'
        },
        items: [
          { content: '測試項目1', is_completed: false },
          { content: '測試項目2', is_completed: false }
        ]
      })
      .expect(200);

    expect(res.body).to.containDeep({
      todo: {
        title: '測試外鍵關聯',
        status: 'ACTIVE'
      },
      items: [
        { content: '測試項目1', is_completed: false },
        { content: '測試項目2', is_completed: false }
      ]
    });

    // 驗證返回的 ID
    expect(res.body.todo.id).to.be.a.Number();
    expect(res.body.items[0].id).to.be.a.Number();
    expect(res.body.items[1].id).to.be.a.Number();

    // 驗證外鍵關聯
    expect(res.body.items[0].todoId).to.equal(res.body.todo.id);
    expect(res.body.items[1].todoId).to.equal(res.body.todo.id);
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
