import Cookies from "js-cookie";

export async function Login(username: string, password: string) {
  var res = await fetch("http://localhost:8080/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  if (res.status === 401) {
    Cookies.remove("auth-token");
    window.location.reload();
  }

  return res;
}

export async function Register(username: string, password: string, name: string, email: string) {
  var res = await fetch("http://localhost:8080/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
      name,
      email,
    }),
  });

  if (res.status === 401) {
    Cookies.remove("auth-token");
    window.location.reload();
  }

  return res;
}

