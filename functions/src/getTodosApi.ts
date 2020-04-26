import * as express from 'express';
import * as cors from 'cors';
import * as moment from 'moment-timezone';
import { db } from './';
import validate from './middlewares/validate';

const app = express();

app.use(cors());

app.post('/getTodos', validate, (req, res) => {
  console.log('INFO: Start getTodos');
  (async () => {
    const targetDay = moment()
      .subtract(req.body.dayBefore, 'days')
      .tz('Asia/Tokyo')
      .format('YYYYMMDD');
    const todosData = await db
      .collection('todos')
      .where('createdDate', '==', targetDay)
      .get();
    if (todosData.empty) {
      console.log('INFO: No todo yet');
      res.status(200);
      return res.json({});
    }
    const addingTodos: { [key: string]: ITodo[] } = {};
    todosData.docs.forEach((doc) => {
      const todo = doc.data();
      if (addingTodos[todo.userId] === undefined) {
        addingTodos[todo.userId] = [];
      } else {
        addingTodos[todo.userId].push(todo as ITodo);
      }
    });
    res.status(200);
    console.log('INFO: End getTodos');
    return res.json({ date: targetDay, todoData: addingTodos });
  })();
});

interface ITodo {
  checked: boolean;
  created: number;
  reatedDate: string;
  id: string;
  text: string;
  userId: string;
}

export default app;
