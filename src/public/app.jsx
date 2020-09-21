const API_URL = "http://" + location.host + "/api";

const rootElement = document.getElementById("root");

class RegView extends React.Component {
  regUser = () => {
    axios
      .post(API_URL + "/user/register", {
        login: this.login.value,
        name: this.name.value,
        password: this.pass.value
      })
      .then((res) => {
        alert("Registration successfully completed.");
        this.login.value = "";
        this.name.value = "";
        this.pass.value = "";
      })
      .catch((e) =>
        alert("Fail registration! Reason: " + e.response.data.error)
      );
  };
  render() {
    return (
      <div>
        <h5>Registration form</h5>
        <div style={{ border: "1px solid black", display: "inline-block" }}>
          <input
            className="inp"
            placeholder="Your login"
            ref={(el) => (this.login = el)}
          />
          <input
            className="inp"
            placeholder="Your name"
            ref={(el) => (this.name = el)}
          />
          <input
            className="inp"
            placeholder="Your password"
            type="password"
            ref={(el) => (this.pass = el)}
          />
          <input value="Add User" type="submit" onClick={this.regUser} />
        </div>
      </div>
    );
  }
}

class LogView extends React.Component {
  loginUser = () => {
    axios
      .post(API_URL + "/user/login", {
        login: this.login.value,
        password: this.pass.value
      })
      .then((res) => {
        alert("Login succeeded.");
        this.props.onLogin(res.data);
        this.login.value = "";
        this.pass.value = "";
      })
      .catch((e) => alert("Fail login! Reason: " + e.response.data.error));
  };
  render() {
    return (
      <div style={{ marginTop: "10" }}>
        <h5>Authorization form</h5>
        <div style={{ border: "1px solid black", display: "inline-block" }}>
          <input
            className="inp"
            placeholder="Your login"
            ref={(el) => (this.login = el)}
          />
          <input
            className="inp"
            placeholder="Your password"
            type="password"
            ref={(el) => (this.pass = el)}
          />
          <input value="Login" type="submit" onClick={this.loginUser} />
        </div>
        <div>
          <label>Current login user:&nbsp;&nbsp;</label>
          {this.props.user && this.props.user.login}
        </div>
      </div>
    );
  }
}

class ImageUploadView extends React.Component {
  constructor(props) {
    super(props);
    this.state = { images: null };
  }
  componentDidMount() {
    this.refreshImages();
  }
  refreshImages = () => {
    axios.get("/api/image/list").then((res) => {
      this.setState({ images: res.data });
    });
  };
  onFileChange = (e) => {
    const filename = this.filename.files[0];
    if (filename) {
      const form = new FormData();
      form.append("image", filename);
      axios
        .post("/api/image/upload", form)
        .then((res) => {
          alert("Image successfully uploaded.");
          this.refreshImages();
        })
        .catch((e) =>
          alert("Fail image upload! Reason: " + e.response.data.error)
        );
    }
  };
  deleteImage = (imageId) => () => {
    axios
      .delete(API_URL + "/image/" + imageId)
      .then((res) => {
        alert("Image successfully deleted.");
        this.refreshImages();
      })
      .catch((e) =>
        alert("Fail deleting image! Reason: " + e.response.data.error)
      );
  };
  render() {
    const images = this.state.images || [];
    return (
      <div>
        <h5>Image upload form</h5>
        <input
          type="File"
          name="filename"
          ref={(el) => (this.filename = el)}
          onChange={this.onFileChange}
        ></input>
        <table style={{ border: "1px solid black" }}>
          <thead>
            <tr>
              <th>Image</th>
              <th>
                <button onClick={this.refreshImages}>Refresh</button>
              </th>
            </tr>
          </thead>
          <tbody>
            {images.map((image) => (
              <tr>
                <td>
                  <img
                    src={image.src}
                    style={{ maxWidth: "100", maxHeight: "100" }}
                    alt="kartinka"
                  />
                </td>
                <td>
                  <button onClick={this.deleteImage(image._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

class GamesView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      games: null,
      categories: null,
      images: null,
      minprice: null,
      maxprice: null,
      selectedCategory: null
    };
  }
  componentDidMount() {
    this.refreshGames();
  }
  refreshGames = (e) => {
    axios
      .get(
        API_URL +
          "/game/list" +
          (this.state.minprice ||
          this.state.maxprice ||
          this.state.selectedCategory
            ? "?"
            : "") +
          (this.state.minprice ? "minprice=" + this.state.minprice : "") +
          (this.state.maxprice ? "&maxprice=" + this.state.maxprice : "") +
          (this.state.selectedCategory
            ? "&selectedCategory=" + this.state.selectedCategory
            : "")
      )
      .then((result) => this.setState({ games: result.data }));
    axios
      .get(API_URL + "/category/list")
      .then((result) => this.setState({ categories: result.data }));
    axios
      .get(API_URL + "/image/list")
      .then((result) => this.setState({ images: result.data }));
  };
  addGame = () => {
    axios
      .post(API_URL + "/game/add", {
        title: "Newbles",
        price: "100"
      })
      .then((res) => {
        alert("Game successfully added.");
        this.refreshGames();
      })
      .catch((e) =>
        alert("Fail adding game! Reason: " + e.response.data.error)
      );
  };
  deleteGame = (id) => {
    axios
      .delete(API_URL + "/game/" + id)
      .then((res) => {
        alert("Game successfully deleted.");
        this.refreshGames();
      })
      .catch((e) =>
        alert("Fail deleting game! Reason: " + e.response.data.error)
      );
  };
  updateGame = (id) => {
    const data = this.state.games.filter((game) => game._id === id)[0];
    axios
      .put(API_URL + "/game/" + id, data)
      .then((res) => {
        alert("Game successfully updated.");
        this.refreshGames();
      })
      .catch((e) =>
        alert("Fail updating game! Reason: " + e.response.data.error)
      );
  };
  updateInput = (id, field) => (e) => {
    const games = this.state.games.map((game) => {
      if (game._id === id) {
        const obj = {
          title: game.title,
          price: game.price,
          category: game.category,
          image: game.image,
          _id: game._id
        };
        obj[field] = e.target.value;
        return obj;
      } else {
        return game;
      }
    });
    this.setState({ games });
  };
  updateFilter = (field) => (e) => {
    this.setState({ [field]: e.target.value });
  };
  render() {
    const games = this.state.games || [];
    const categories = this.state.categories || [];
    const images = this.state.images || [];
    return (
      <div style={{ marginTop: "10" }}>
        <h5>Video games</h5>
        <table style={{ border: "1px solid black" }}>
          <thead>
            <tr>
              <th>Image</th>
              <th>Select Image</th>
              <th>Title</th>
              <th>Price</th>
              <th>Category</th>
              <th>
                <button onClick={this.addGame}>Add</button>
              </th>
              <th>
                <button onClick={this.refreshGames}>Refresh</button>
              </th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              <tr>
                <td>
                  <img
                    src={
                      images.filter((img) => img._id === game.image).length ===
                        1 &&
                      images.filter((img) => img._id === game.image)[0].src
                    }
                    style={{ maxWidth: "100", maxHeight: "100" }}
                    alt="kartinka"
                  />
                </td>
                <td>
                  <select onChange={this.updateInput(game._id, "image")}>
                    <option value="">Empty</option>
                    {images.map((image) => (
                      <option
                        value={image._id}
                        selected={image._id === game.image}
                      >
                        {image.filename}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    className="inp"
                    value={game.title}
                    onChange={this.updateInput(game._id, "title")}
                  ></input>
                </td>
                <td>
                  <input
                    className="inp"
                    value={game.price}
                    onChange={this.updateInput(game._id, "price")}
                  ></input>
                </td>
                <td>
                  <select onChange={this.updateInput(game._id, "category")}>
                    <option value="">Not selected</option>
                    {categories.map((c) => (
                      <option value={c._id} selected={c._id === game.category}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button onClick={() => this.updateGame(game._id)}>
                    Save
                  </button>
                </td>
                <td>
                  <button
                    onClick={() => {
                      this.deleteGame(game._id);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td>
                <input
                  className="inp"
                  type="number"
                  placeholder="Min Price"
                  onChange={this.updateFilter("minprice")}
                ></input>
              </td>
              <td>
                <select onChange={this.updateFilter("selectedCategory")}>
                  <option value="">No Filter</option>
                  {categories.map((c) => (
                    <option
                      value={c._id}
                      selected={c._id === this.state.selectedCategory}
                    >
                      {c.title}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td>
                <input
                  className="inp"
                  type="number"
                  placeholder="Max Price"
                  onChange={this.updateFilter("maxprice")}
                ></input>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

class CategoryView extends React.Component {
  constructor(props) {
    super(props);
    this.state = { categories: null, images: null };
  }
  componentDidMount() {
    this.refreshCategories();
  }
  refreshCategories = (e) => {
    axios
      .get(API_URL + "/category/list")
      .then((result) => this.setState({ categories: result.data }));
    axios
      .get(API_URL + "/image/list")
      .then((result) => this.setState({ images: result.data }));
  };
  addCategory = () => {
    axios
      .post(API_URL + "/category/add", {
        title: "Catgles"
      })
      .then((res) => {
        alert("Category successfully added.");
        this.refreshCategories();
      })
      .catch((e) =>
        alert("Fail adding category! Reason: " + e.response.data.error)
      );
  };
  deleteCategory = (id) => {
    axios
      .delete(API_URL + "/category/" + id)
      .then((res) => {
        alert("Category successfully deleted.");
        this.refreshCategories();
      })
      .catch((e) =>
        alert("Fail deleting category! Reason: " + e.response.data.error)
      );
  };
  updateCategory = (id) => {
    const data = this.state.categories.filter(
      (category) => category._id === id
    )[0];
    axios
      .put(API_URL + "/category/" + id, data)
      .then((res) => {
        alert("Category successfully updated.");
        this.refreshCategories();
      })
      .catch((e) =>
        alert("Fail updating category! Reason: " + e.response.data.error)
      );
  };
  updateInput = (id, field) => (e) => {
    const categories = this.state.categories.map((category) => {
      if (category._id === id) {
        const obj = {
          title: category.title,
          image: category.Image,
          _id: category._id
        };
        obj[field] = e.target.value;
        return obj;
      } else {
        return category;
      }
    });
    this.setState({ categories });
  };

  render() {
    const categories = this.state.categories || [];
    const images = this.state.images || [];
    return (
      <div style={{ marginTop: "10" }}>
        <h5>Video game categories</h5>
        <table style={{ border: "1px solid black" }}>
          <thead>
            <tr>
              <th>Image</th>
              <th>Select Image</th>
              <th>Title</th>
              <th>
                <button onClick={this.addCategory}>Add</button>
              </th>
              <th>
                <button onClick={this.refreshCategories}>Refresh</button>
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr>
                <td>
                  <img
                    src={
                      images.filter((img) => img._id === category.image)
                        .length === 1 &&
                      images.filter((img) => img._id === category.image)[0].src
                    }
                    style={{ maxWidth: "100", maxHeight: "100" }}
                    alt="kartinka"
                  />
                </td>
                <td>
                  <select onChange={this.updateInput(category._id, "image")}>
                    <option value="">Empty</option>
                    {images.map((image) => (
                      <option
                        value={image._id}
                        selected={image._id === category.image}
                      >
                        {image.filename}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    className="inp"
                    value={category.title}
                    onChange={this.updateInput(category._id, "title")}
                  ></input>
                </td>
                <td>
                  <button onClick={() => this.updateCategory(category._id)}>
                    Save
                  </button>
                </td>
                <td>
                  <button onClick={() => this.deleteCategory(category._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

class OrderForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: null,
      games: null,
      categories: null,
      images: null,
      selectedUser: null,
      selectedGames: []
    };
  }
  componentDidMount() {
    this.refreshOrder();
  }
  componentDidUpdate(prevProps) {
    if (this.props.editOrderId !== prevProps.editOrderId) {
      this.refreshOrder();
    }
  }
  refreshOrder = (e) => {
    axios
      .get(API_URL + "/user/list")
      .then((result) => this.setState({ users: result.data }));
    axios
      .get(API_URL + "/game/list")
      .then((result) => this.setState({ games: result.data }));
    axios
      .get(API_URL + "/category/list")
      .then((result) => this.setState({ categories: result.data }));
    axios
      .get(API_URL + "/image/list")
      .then((result) => this.setState({ images: result.data }));
    if (!this.props.editOrderId) {
      if (!this.state.selectedUser && this.props.user)
        this.setState({ selectedUser: this.props.user.login });
    } else {
      axios.get(API_URL + "/order/list").then((result) => {
        const order = result.data.filter(
          (order) => order._id === this.props.editOrderId
        )[0];
        this.setState({
          selectedUser: order.user,
          selectedGames: order.games.slice()
        });
      });
    }
  };
  updateInput = (field) => (e) => {
    this.setState({ [field]: e.target.value });
  };
  updateSelection = (id) => (e) => {
    if (e.target.checked) {
      const sels = this.state.selectedGames;
      if (sels.filter((s) => s === id).length) return;
      const selGames = [id];
      this.state.selectedGames.forEach((game) => selGames.push(game));
      this.setState({ selectedGames: selGames });
    } else if (!e.target.checked) {
      const sels = this.state.selectedGames;
      if (!sels.filter((s) => s === id).length) return;
      const selGames = this.state.selectedGames.filter((el) => el !== id);
      this.setState({ selectedGames: selGames });
    }
  };
  makeOrder = () => {
    if (!this.props.editOrderId) {
      axios
        .post(API_URL + "/order/add", {
          user: this.state.selectedUser,
          games: this.state.selectedGames
        })
        .then((res) => {
          alert("Order successfully added.");
          this.setState({ selectedUser: null, selectedGames: [] });
          this.refreshOrder();
        })
        .catch((e) =>
          alert("Fail adding order! Reason: " + e.response.data.error)
        );
    } else {
      axios
        .put(API_URL + "/order/" + this.props.editOrderId, {
          user: this.state.selectedUser,
          games: this.state.selectedGames
        })
        .then((res) => {
          alert("Order successfully updated.");
          this.props.stopEditOrder();
          this.setState({ selectedUser: null, selectedGames: [] });
          this.refreshOrder();
        })
        .catch((e) =>
          alert("Fail updating order! Reason: " + e.response.data.error)
        );
    }
  };
  render() {
    const users = this.state.users || [];
    const games = this.state.games || [];
    const categories = this.state.categories || [];
    const images = this.state.images || [];
    const selectedGames = this.state.selectedGames || [];
    const selectedUser = this.state.selectedUser;
    let total = 0;
    games.forEach((g) => {
      for (let zum of selectedGames) {
        if (zum === g._id) {
          total += g.price;
        }
      }
    });
    return (
      <div style={{ marginTop: "10" }}>
        <h5>Select video games to make order</h5>
        <table style={{ border: "1px solid black" }}>
          <thead>
            <tr>
              <th>Client:</th>
              <th>
                <select onChange={this.updateInput("selectedUser")}>
                  <option value="">No one</option>
                  {users.map((u) => (
                    <option
                      value={u.login}
                      selected={u.login === this.state.selectedUser}
                    >
                      {u.name}
                    </option>
                  ))}
                </select>
              </th>
              <th>
                <button
                  disabled={!selectedUser || !total}
                  onClick={this.makeOrder}
                >
                  {(this.props.editOrderId ? "Edit" : "Make") + " Order"}
                </button>
              </th>
              <th>
                <button onClick={this.refreshOrder}>Refresh</button>
              </th>
              <th colspan="2">
                {this.props.editOrderId && (
                  <button onClick={this.props.stopEditOrder}>
                    Cancel Editing
                  </button>
                )}
              </th>
            </tr>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Price</th>
              <th>Category</th>
              <th>Total:</th>
              <th>{total}</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              <tr>
                <td>
                  <img
                    src={
                      images.filter((img) => img._id === game.image).length ===
                        1 &&
                      images.filter((img) => img._id === game.image)[0].src
                    }
                    style={{ maxWidth: "100", maxHeight: "100" }}
                    alt="kartinka"
                  />
                </td>
                <td>{game.title}</td>
                <td>{game.price}</td>
                <td>
                  <select disabled>
                    <option value="">Not selected</option>
                    {categories.map((c) => (
                      <option value={c._id} selected={c._id === game.category}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="checkbox"
                    onChange={this.updateSelection(game._id)}
                    checked={
                      selectedGames.filter((id) => id === game._id).length === 1
                    }
                  />
                </td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

class OrdersView extends React.Component {
  constructor(props) {
    super(props);
    this.state = { orders: null };
  }
  componentDidMount() {
    this.refreshOrders();
  }
  refreshOrders = (e) => {
    axios
      .get(API_URL + "/order/list?ext=true")
      .then((result) => {
        this.setState({ orders: result.data });
      })
      .catch((e) =>
        alert("Fail list orders! Reason: " + e.response.data.error)
      );
  };
  deleteOrder = (id) => {
    axios
      .delete(API_URL + "/order/" + id)
      .then((res) => {
        alert("Order successfully deleted.");
        this.refreshOrders();
      })
      .catch((e) =>
        alert("Fail deleting order! Reason: " + e.response.data.error)
      );
  };

  render() {
    const orders = this.state.orders || [];
    return (
      <div style={{ marginTop: "10" }}>
        <table style={{ border: "1px solid black" }}>
          <thead>
            <tr>
              <th>№</th>
              <th>Total</th>
              <th>Name</th>
              <th colspan="2">
                <button
                  onClick={() => {
                    if (this.props.user) {
                      this.refreshOrders();
                    } else {
                      alert("To see your orders you should be logged in");
                    }
                  }}
                >
                  Refresh
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr>
                <td>{order._id}</td>
                <td>{order.total}</td>
                <td>{order.username}</td>
                <td>
                  <button onClick={() => this.props.editOrder(order._id)}>
                    Edit
                  </button>
                </td>
                <td>
                  <button onClick={() => this.deleteOrder(order._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { user: null, editOrderId: null };
  }
  onLogin = (data) => {
    this.setState({ user: data });
    axios.defaults.headers.common["Authorization"] = data.jwt;
  };
  editOrder = (id) => {
    this.setState({ editOrderId: id });
  };
  stopEditOrder = () => {
    this.setState({ editOrderId: null });
  };
  render() {
    return (
      <div>
        <h2>Welcome to VGS</h2>
        <h5>
          To see documentation goto{" "}
          <a href={"http://" + location.host + "/docs"}>
            {"http://" + location.host + "/docs"}
          </a>
        </h5>
        <RegView />
        <hr />
        <LogView onLogin={this.onLogin} user={this.state.user} />
        <hr />
        <ImageUploadView />
        <hr />
        <GamesView />
        <hr />
        <CategoryView />
        <hr />
        <OrderForm
          user={this.state.user}
          editOrderId={this.state.editOrderId}
          stopEditOrder={this.stopEditOrder}
        />
        <hr />
        <OrdersView editOrder={this.editOrder} user={this.state.user} />
      </div>
    );
  }
}

ReactDOM.render(<App />, rootElement);

setTimeout(() => {
  window.scrollTo(
    0,
    0 //document.body.scrollHeight
  );
}, 1000);
