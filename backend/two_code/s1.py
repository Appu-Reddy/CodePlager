# s1.py
import datetime

class Task:
    def __init__(self, title, description):
        self.title = title
        self.description = description
        self.created_at = datetime.datetime.now()
        self.completed = False

    def mark_done(self):
        self.completed = True

    def __str__(self):
        status = "Done" if self.completed else "Pending"
        return f"{self.title} - {status}\n{self.description}\nCreated at: {self.created_at}"

class TaskManager:
    def __init__(self):
        self.tasks = []

    def add_task(self, title, description):
        task = Task(title, description)
        self.tasks.append(task)

    def list_tasks(self):
        for index, task in enumerate(self.tasks):
            print(f"{index + 1}. {task}")

    def complete_task(self, task_index):
        if 0 <= task_index < len(self.tasks):
            self.tasks[task_index].mark_done()

    def delete_task(self, task_index):
        if 0 <= task_index < len(self.tasks):
            del self.tasks[task_index]

def main():
    tm = TaskManager()
    tm.add_task("Buy groceries", "Milk, Eggs, Bread")
    tm.add_task("Study Python", "Finish OOP section")
    tm.complete_task(0)
    tm.list_tasks()

if __name__ == "__main__":
    main()
