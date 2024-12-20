import { Client, expect } from '@loopback/testlab';
import { TodoAppApplication } from '../..';
import { TodoRepository } from '../../repositories';
import { initializeTestDatabase } from '../../utils/test-db-init';
import { setupApplication } from './test-helper';

interface TodoItem {
  id: number;
  content: string;
  todoId: number;
  is_completed: boolean;
  completed_at: string | null;
}

describe('TodoController', () => {
  describe('整合測試 (需要資料庫)', () => {
    let app: TodoAppApplication;
    let client: Client;

    before(async () => {
      try {
        await initializeTestDatabase();
        ({ app, client } = await setupApplication());
      } catch (error) {
        console.error('測試設置失敗:', error);
        throw error;
      }
    });

    beforeEach(async () => {
      try {
        const todoRepo = await app.getRepository(TodoRepository);
        await todoRepo.deleteAll();
      } catch (error) {
        console.error('清理測試數據失敗:', error);
        throw error;
      }
    });

    after(async () => {
      if (app) {
        await app.stop();
      }
    });

    it('新增 Todo 並同時新增多個 Items - 成功', async () => {
      const res = await client.post('/todos').send({
        todo: {
          title: '測試標題',
          subtitle: '測試副標題',
          status: 'ACTIVE',
        },
        items: [
          { content: '測試項目1', is_completed: false },
          { content: '測試項目2', is_completed: false },
        ],
      });

      expect(res.status).to.equal(200);
      expect(res.body.todo).to.containDeep({
        title: '測試標題',
        subtitle: '測試副標題',
        status: 'ACTIVE',
      });
      expect(res.body.todo.id).to.be.a.Number();
      expect(res.body.items).to.have.length(2);
      expect(res.body.items[0].todoId).to.equal(res.body.todo.id);
    });

    it('取得所有 Todo（分頁和篩選）- 成功', async () => {
      // 先創建測試數據
      await client.post('/todos').send({
        todo: { title: '待辦事項1', status: 'ACTIVE' },
        items: [{ content: '項目1', is_completed: false }],
      });
      await client.post('/todos').send({
        todo: { title: '待辦事項2', status: 'INACTIVE' },
        items: [{ content: '項目2', is_completed: true }],
      });

      // 測試分頁
      const pageRes = await client.get('/todos').query({
        page: 1,
        limit: 1,
      });
      expect(pageRes.status).to.equal(200);
      expect(pageRes.body).to.have.length(1);

      // 測試狀態篩選
      const filterRes = await client.get('/todos').query({
        status: 'ACTIVE',
      });
      expect(filterRes.status).to.equal(200);
      expect(filterRes.body).to.have.length(1);
      expect(filterRes.body[0].status).to.equal('ACTIVE');
      expect(filterRes.body[0].items).to.be.Array();
    });

    it('根據 ID 取得單一 Todo - 成功', async () => {
      // 先創建測試數據
      const createRes = await client.post('/todos').send({
        todo: { title: '測試標題', status: 'ACTIVE' },
        items: [{ content: '測試項目', is_completed: false }],
      });

      const todoId = createRes.body.todo.id;
      const getRes = await client.get(`/todos/${todoId}`);

      expect(getRes.status).to.equal(200);
      expect(getRes.body.id).to.equal(todoId);
      expect(getRes.body.items).to.be.Array();
    });

    it('根據 ID 更新 Todo - 成功', async () => {
      // 先創建測試數據
      const createRes = await client.post('/todos').send({
        todo: { title: '原標題', status: 'ACTIVE' },
        items: [{ content: '測試項目', is_completed: false }],
      });

      const todoId = createRes.body.todo.id;
      const updateRes = await client.patch(`/todos/${todoId}`).send({
        title: '新標題',
        status: 'INACTIVE',
      });

      expect(updateRes.status).to.equal(200);
      expect(updateRes.body.title).to.equal('新標題');
      expect(updateRes.body.status).to.equal('INACTIVE');
    });

    it('根據 ID 軟刪除 Todo - 成功', async () => {
      // 先創建測試數據
      const createRes = await client.post('/todos').send({
        todo: { title: '測試標題', status: 'ACTIVE' },
        items: [{ content: '測試項目', is_completed: false }],
      });

      const todoId = createRes.body.todo.id;

      // 執行軟刪除
      const deleteRes = await client.delete(`/todos/${todoId}`);
      expect(deleteRes.status).to.equal(204);

      // 確認該記錄已被軟刪除（應該返回 404）
      const getRes = await client.get(`/todos/${todoId}`);
      expect(getRes.status).to.equal(404);
      expect(getRes.body.error).to.containDeep({
        statusCode: 404,
        name: 'ApiError',
        message: '找不到該待辦事項',
        code: 'NOT_FOUND',
        details: {
          id: todoId,
        },
      });
    });

    describe('GET /todos/{id}', () => {
      it('查詢不存在的 Todo ID - 應該返回 404', async () => {
        const nonExistentId = 99999;
        const res = await client.get(`/todos/${nonExistentId}`);

        expect(res.status).to.equal(404);
        expect(res.body.error).to.containDeep({
          statusCode: 404,
          name: 'ApiError',
          message: '找不到該待辦事項',
          code: 'NOT_FOUND',
          details: {
            id: nonExistentId,
          },
        });
      });

      it('查詢無效的 Todo ID - 應該返回 400', async () => {
        const invalidId = 'invalid';
        const res = await client.get(`/todos/${invalidId}`);

        expect(res.status).to.equal(400);
        expect(res.body.error).to.containDeep({
          statusCode: 400,
          name: 'BadRequestError',
          message: 'Invalid data "invalid" for parameter "id".',
          code: 'INVALID_PARAMETER_VALUE',
        });
      });

      it('查詢已被軟刪除的 Todo - 應該返回 404', async () => {
        // 先創建一個 Todo
        const createRes = await client.post('/todos').send({
          todo: { title: '測試標題', status: 'ACTIVE' },
          items: [],
        });
        const todoId = createRes.body.todo.id;

        // 軟刪除該 Todo
        await client.delete(`/todos/${todoId}`);

        // 嘗試查詢該 Todo
        const getRes = await client.get(`/todos/${todoId}`);

        expect(getRes.status).to.equal(404);
        expect(getRes.body.error).to.containDeep({
          statusCode: 404,
          name: 'ApiError',
          message: '找不到該待辦事項',
          code: 'NOT_FOUND',
          details: {
            id: todoId,
          },
        });
      });

      it('查詢存在的 Todo - 應該返回完整資料', async () => {
        // 先清理可能存在的測試數據
        const todoRepo = await app.getRepository(TodoRepository);
        await todoRepo.deleteAll();

        // 創建測試數據
        const createRes = await client.post('/todos').send({
          todo: {
            title: '測試標題',
            subtitle: '測試副標題',
            status: 'ACTIVE',
          },
          items: [
            { content: '測試項目1', is_completed: false },
            { content: '測試項目2', is_completed: true },
          ],
        });

        const todoId = createRes.body.todo.id;

        // 查詢該 Todo
        const getRes = await client.get(`/todos/${todoId}`);

        expect(getRes.status).to.equal(200);
        expect(getRes.body).to.containDeep({
          id: todoId,
          title: '測試標題',
          subtitle: '測試副標題',
          status: 'ACTIVE',
        });
        expect(getRes.body.items).to.have.length(2);

        // 找到對應的項目進行驗證
        const item1 = getRes.body.items.find(
          (item: TodoItem) => item.content === '測試項目1',
        );
        const item2 = getRes.body.items.find(
          (item: TodoItem) => item.content === '測試項目2',
        );

        expect(item1).to.containDeep({
          content: '測試項目1',
          is_completed: false,
        });

        expect(item2).to.containDeep({
          content: '測試項目2',
          is_completed: true,
        });
      });
    });
  });

  describe('單元測試 (驗證錯誤處理)', () => {
    let client: Client;

    before(async () => {
      ({ client } = await setupApplication());
    });

    it('新增 Todo - 缺少必填欄位應該失敗', async () => {
      const res = await client.post('/todos').send({
        todo: { status: 'ACTIVE' }, // 缺少 title
        items: [],
      });

      expect(res.status).to.equal(422);
      expect(res.body.error).to.containDeep({
        statusCode: 422,
        name: 'UnprocessableEntityError',
        code: 'VALIDATION_FAILED',
        details: [
          {
            path: '/todo',
            code: 'required',
            message: "must have required property 'title'",
          },
        ],
      });
    });

    it('新增 Todo - 狀態值無效應該失敗', async () => {
      const res = await client.post('/todos').send({
        todo: {
          title: '測試標題',
          status: 'INVALID_STATUS', // 無效的狀態值
        },
        items: [],
      });

      expect(res.status).to.equal(422);
      expect(res.body.error).to.containDeep({
        statusCode: 422,
        name: 'UnprocessableEntityError',
        code: 'VALIDATION_FAILED',
        details: [
          {
            path: '/todo/status',
            code: 'enum',
            message: 'must be equal to one of the allowed values',
          },
        ],
      });
    });
  });
});
