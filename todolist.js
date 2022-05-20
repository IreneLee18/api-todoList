// import app from './index.js';
const app = Vue.createApp({
  data() {
    return {
      // API
      apiUrl: "https://todoo.5xcamp.us",
      // 目前頁面
      currentPage: "login",
      // login & register
      email: "",
      emailError: false,
      password: "",
      passwordError: false,
      passwordAgain: "",
      passwordAgainError: false,
      userName: "",
      userNameError: false,
      // todoList
      myTodoName: "", // 用戶名稱
      currentTab: "全部",
      tabs: ["全部", "待完成", "已完成"],
      newTodo: "", // input.value
      allData: [], // 存放所有資料
      selectData: [], // 存放篩選資料
      deleteData: [], // 存放已完成且要全部刪除的資料
    };
  },
  methods: {
    // 登入
    login() {
      axios
        .post(`${this.apiUrl}/users/sign_in`, {
          user: {
            email: this.email,
            password: this.password,
          },
        })
        .then((res) => {
          axios.defaults.headers.common["Authorization"] =
            res.headers.authorization;
          this.currentPage = "todoList";
          this.myTodoName = res.data.nickname;
          this.email = "";
          this.password = "";
          console.log("登入成功", res, "myTodoName", this.myTodoName);
          this.renderData();
        })
        .catch((err) => {
          alert(err.response.data.message), console.log(err.response);
        });
      const isMail =
        /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
      this.email === "" || !isMail.test(this.email)
        ? (this.emailError = true)
        : (this.emailError = false);
      this.password.length < 6
        ? (this.passwordError = true)
        : (this.passwordError = false);
    },
    // 註冊
    register() {
      axios
        .post(`${this.apiUrl}/users`, {
          user: {
            email: this.email,
            nickname: this.userName,
            password: this.password,
          },
        })
        .then((res) => {
          console.log("ok");
          console.log(res.data);
          this.currentPage = "login";
          this.email = "";
          this.password = "";
          this.passwordAgain = "";
          this.userName = "";
        })
        .catch((err) => {
          alert(err.response.data.message), console.log(err.response);
        });
      const isMail =
        /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
      this.email === "" || !isMail.test(this.email)
        ? (this.emailError = true)
        : (this.emailError = false);
      this.password.length < 6
        ? (this.passwordError = true)
        : (this.passwordError = false);
      this.passwordAgain === "" || this.passwordAgain != this.password
        ? (this.passwordAgainError = true)
        : (this.passwordAgainError = false);
      this.userName === ""
        ? (this.userNameError = true)
        : (this.userNameError = false);
    },
    // 切換頁面（登入、註冊、ToDo）
    switchPage() {
      this.renderInput();
      if (this.currentPage === "login") {
        this.currentPage = "register";
      } else {
        this.currentPage = "login";
      }
    },
    // 渲染input
    renderInput() {
      this.email = "";
      this.password = "";
      this.passwordAgain = "";
      this.userName = "";
      this.emailError = false;
      this.passwordError = false;
      this.passwordAgainError = false;
      this.userNameError = false;
    },
    // 渲染todo頁面的data值
    renderData() {
      axios
        .get(`${this.apiUrl}/todos`)
        .then((res) => {
          this.allData = res.data.todos;
          // 原本寫在這裡，但因為每次都會更新renderData因此會一直重複賦予值，所以就試著改放在deleteAll上，就可以正常運作了
          // this.doneData.forEach((item) => {
          //   this.deleteData.push(item.id);
          // });
          console.log("getDone", res, this.deleteData, this.doneData);
        })
        .catch((err) => console.log("get", err.response));
    },
    // 新增todo
    addList() {
      if (this.newTodo === "") {
        return alert("記得輸入一些東西唷！");
      }
      axios
        .post(`${this.apiUrl}/todos`, {
          todo: {
            content: this.newTodo,
          },
        })
        .then((res) => {
          this.allData.unshift(res.data);
          this.renderData();
          console.log(res.data, "this.allData", this.allData);
        })
        .catch((err) => console.log("尚未登入", err.response));

      this.newTodo = "";
      this.currentTab = "全部";
    },
    // checked todo
    checkTodo(id) {
      axios
        .patch(`${this.apiUrl}/todos/${id}/toggle`)
        .then((res) => {
          // 使用this.allData = res.data;的話後面computed會出錯，原因在於因為res.data取到是目前的所點擊的，而非所有的data
          // this.allData = res.data;
          this.renderData();
          console.log(res, "all", this.allData);
        })
        .catch((err) => console.log(err.response));
    },
    // 刪除單筆 todo
    deleteList(id) {
      axios
        .delete(`${this.apiUrl}/todos/${id}`)
        .then((res) => {
          this.renderData();
          console.log(res, this.allData);
        })
        .catch((err) => console.log(err.response));
      this.currentTab = "全部";
    },
    // 刪除所有已完成 todo
    deleteAll() {
      this.doneData.forEach((item) => {
        this.deleteData.push(item.id);
      });
      this.renderData();
      Promise.all(this.deleteData)
        .then((res) => {
          console.log("deleteAll", res);
        })
        .catch((err) => console.log(err.response));
      for (let i = 1; i <= this.deleteData.length; i++) {
        console.log(i);
        axios
          .delete(`${this.apiUrl}/todos/${this.deleteData[i - 1]}`)
          .then((res) => {
            this.renderData();
            this.deleteData = [];
            console.log(res, this.allData);
          })
          .catch((err) => console.log(err.response));
      }
      this.currentTab = "全部";
    },
    // 登出
    logout() {
      axios
        .delete(`${this.apiUrl}/users/sign_out`)
        .then((res) => {
          console.log("logout", res);
          this.currentPage = "login";
          this.emailError = false;
          this.passwordError = false;
        })
        .catch((err) => console.log(err.response));
    },
  },
  computed: {
    // 讀取data的值：讀取資料，並篩選符合條件後，再重新渲染在畫面！！
    filterData() {
      if (this.currentTab === "已完成") {
        return (this.selectData = this.allData.filter((item) => {
          return item.completed_at !== null;
        }));
      } else if (this.currentTab === "待完成") {
        return (this.selectData = this.allData.filter((item) => {
          return item.completed_at === null;
        }));
      } else {
        return (this.selectData = this.allData);
      }
    },
    workData() {
      return this.allData.filter((item) => {
        return item.completed_at === null;
      });
    },
    doneData() {
      return this.allData.filter((item) => {
        return item.completed_at !== null;
      });
    },
  },
  watch: {
    // 監聽 email
    email() {
      const isMail =
        /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
      if (!isMail.test(this.email) || this.email === "") {
        this.emailError = true;
      } else {
        this.emailError = false;
      }
    },
    // 監聽 密碼
    password() {
      if (this.password.length < 6) {
        if (this.password === "") {
          this.passwordError = true;
        }
      } else {
        this.passwordError = false;
      }
    },
    // 監聽 再次輸入密碼
    passwordAgain() {
      if (this.passwordAgain != this.password) {
        if (this.passwordAgain === "") {
          this.passwordAgainError = true;
        }
      } else {
        this.passwordAgainError = false;
      }
    },
    // 監聽 使用者名稱
    userName() {
      if (this.userName === "") {
        this.userNameError = true;
      } else {
        this.userNameError = false;
      }
    },
  },
});
app.mount("#app");
