import { onRequestDelete as __api_orders__key__js_onRequestDelete } from "/home/claude/noyas-cart/functions/api/orders/[key].js"
import { onRequestPatch as __api_orders__key__js_onRequestPatch } from "/home/claude/noyas-cart/functions/api/orders/[key].js"
import { onRequestPost as __api_login_js_onRequestPost } from "/home/claude/noyas-cart/functions/api/login.js"
import { onRequestGet as __api_orders_index_js_onRequestGet } from "/home/claude/noyas-cart/functions/api/orders/index.js"
import { onRequestPost as __api_orders_index_js_onRequestPost } from "/home/claude/noyas-cart/functions/api/orders/index.js"
import { onRequest as __functions___path___js_onRequest } from "/home/claude/noyas-cart/functions/functions/[[path]].js"

export const routes = [
    {
      routePath: "/api/orders/:key",
      mountPath: "/api/orders",
      method: "DELETE",
      middlewares: [],
      modules: [__api_orders__key__js_onRequestDelete],
    },
  {
      routePath: "/api/orders/:key",
      mountPath: "/api/orders",
      method: "PATCH",
      middlewares: [],
      modules: [__api_orders__key__js_onRequestPatch],
    },
  {
      routePath: "/api/login",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_login_js_onRequestPost],
    },
  {
      routePath: "/api/orders",
      mountPath: "/api/orders",
      method: "GET",
      middlewares: [],
      modules: [__api_orders_index_js_onRequestGet],
    },
  {
      routePath: "/api/orders",
      mountPath: "/api/orders",
      method: "POST",
      middlewares: [],
      modules: [__api_orders_index_js_onRequestPost],
    },
  {
      routePath: "/functions/:path*",
      mountPath: "/functions",
      method: "",
      middlewares: [],
      modules: [__functions___path___js_onRequest],
    },
  ]