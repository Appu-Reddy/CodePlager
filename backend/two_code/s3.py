# s2.py
import datetime as dt

class ToDoItem:
    def __init__(self, name, details):
        self.name = name
        self.details = details
        self.time_created = dt.datetime.now()
        self.is_done = False

    def finish(self):
        self.is_done = True

    def __repr__(self):
        status = "✔" if self.is_done else "✘"
        return f"{self.name} [{status}]\n{self.details}\nTime: {self.time_created}"

class ToDoApp:
    def __init__(self):
        self.todo_list = []

    def create_item(self, name, details):
        item = ToDoItem(name, details)
        self.todo_list.append(item)

    def show_items(self):
        for idx, item in enumerate(self.todo_list):
            print(f"{idx + 1}. {item}")

    def mark_done(self, index):
        if 0 <= index < len(self.todo_list):
            self.todo_list[index].finish()

    def remove_item(self, index):
        if 0 <= index < len(self.todo_list):
            self.todo_list.pop(index)

def run():
    app = ToDoApp()
    app.create_item("Go shopping", "Buy some fruit and snacks")
    app.create_item("Learn Python", "Work on classes and objects")
    app.mark_done(0)
    app.show_items()

if __name__ == "__main__":
    run()
