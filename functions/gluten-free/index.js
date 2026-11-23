// /gluten-free has no page of its own: send people to the home page
export const onRequestGet = ({ request }) => Response.redirect(new URL("/", request.url).toString(), 301);
