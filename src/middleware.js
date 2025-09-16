// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";

// const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

// // Define protected route groups by role
// const roleRoutes = {
//   admin: "/admin",
//   author: "/author",
//   editor: "/editor",
//   viewer: "/viewer",
//   "super-admin": "/super-admin",
//   ceo: "/ceo",
// };

// export async function middleware(req) {
//   const token = req.cookies.get("auth_token")?.value;
//   const { pathname } = req.nextUrl;
//  console.log("PathName",pathname);

//   // 🔹 Handle login routes: if already logged in → redirect to dashboard
//   for (const role of Object.keys(roleRoutes)) {
//     if (
//       pathname === `${roleRoutes[role]}/login` ||
//       pathname === `${roleRoutes[role]}/register`
//     ) {
//       if (token) {
//         console.log("Token",token);
//         try {
//           const { payload } = jwt.verify(token, JWT_SECRET);
//           console.log("Payload",payload)
//           return NextResponse.redirect(
//             new URL(`${roleRoutes[payload.role]}/dashboard`, req.url)
//             // router.push(`/${role}/dashboard`);
//           );
//         } catch {
//           return NextResponse.next(); // invalid token → allow login
//         }
//       }
//       return NextResponse.next(); // no token → allow login
//     }
//   }

//   // 🔹 Protect all role routes dynamically
//   for (const [role, basePath] of Object.entries(roleRoutes)) {
//     if (pathname.startsWith(basePath)) {
//       if (!token) {
//         return NextResponse.redirect(new URL(`${basePath}/login`, req.url));
//       }
//       try {
//         const { payload } = jwt.verify(token, JWT_SECRET);
//         if (payload.role !== role) {
//           return NextResponse.redirect(
//             new URL(`${roleRoutes[payload.role]}/dashboard`, req.url)
//           );
//         }
//       } catch {
//         // invalid/expired token → force login
//         return NextResponse.redirect(new URL(`${basePath}/login`, req.url));
//       }
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/admin/:path*",
//     "/author/:path*",
//     "/editor/:path*",
//     "/viewer/:path*",
//     "/super-admin/:path*",
//     "/ceo/:path*",
//   ],
// };


import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");
console.log("JWT_SECRET",JWT_SECRET);

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);

const roleRoutes = {
  admin: "/admin",
  author: "/author",
  editor: "/editor",
  viewer: "/viewer",
  "super-admin": "/super-admin",
  ceo: "/ceo",
};

export async function middleware(req) {
  const token = req.cookies.get("auth_token")?.value;
  const { pathname } = req.nextUrl;

  // Handle login routes
  for (const role of Object.keys(roleRoutes)) {
    if (
      pathname === `${roleRoutes[role]}/login` ||
      pathname === `${roleRoutes[role]}/register`
    ) {
      if (token) {
        try {
          const { payload } = await jwtVerify(token, secretKey);
          return NextResponse.redirect(
            new URL(`${roleRoutes[payload.role]}/dashboard`, req.url)
          );
        } catch {
          return NextResponse.next();
        }
      }
      return NextResponse.next();
    }
  }

  // Protect role routes
  for (const [role, basePath] of Object.entries(roleRoutes)) {
    if (pathname.startsWith(basePath)) {
      if (!token) {
        return NextResponse.redirect(new URL(`${basePath}/login`, req.url));
      }
      try {
        const { payload } = await jwtVerify(token, secretKey);
        console.log("Payload",payload);
        if (payload.role !== role) {
          return NextResponse.redirect(
            new URL(`${roleRoutes[payload.role]}/dashboard`, req.url)
          );
        }
      } catch {
        return NextResponse.redirect(new URL(`${basePath}/login`, req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/author/:path*",
    "/editor/:path*",
    "/viewer/:path*",
    "/super-admin/:path*",
    "/ceo/:path*",
  ],
};
