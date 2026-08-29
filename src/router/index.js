import { createRouter, createWebHashHistory } from 'vue-router'

/* Layout */
import Layout from '@/layout/index.vue'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [{
  path: '/redirect',
  component: Layout,
  hidden: true,
  children: [{
    path: '/redirect/:pathMatch(.*)*',
    component: () =>
      import('@/views/redirect/index.vue')
  }]
},
{
  path: '/login',
  component: () =>
    import('@/views/login/index.vue'),
  hidden: true
},
{
  path: '/register',
  component: () =>
    import('@/views/register/index.vue'),
  hidden: true
},

{
  path: '/auth-redirect',
  component: () =>
    import('@/views/login/auth-redirect.vue'),
  hidden: true
},
{
  path: '/404',
  component: () =>
    import('@/views/error-page/404.vue'),
  hidden: true
},
{
  path: '/401',
  component: () =>
    import('@/views/error-page/401.vue'),
  hidden: true
},
{
  path: '',
  component: Layout,
  redirect: 'dashboard',
  children: [{
    path: 'dashboard',
    component: () =>
      import('@/views/dashboard/index.vue'),
    name: 'Dashboard',
    meta: { title: 'dashboard', icon: 'dashboard', affix: true, noCache: true }
  }]
},

{
  path: '/profile',
  component: Layout,
  redirect: '/profile/index',
  hidden: true,
  children: [{
    path: 'index',
    component: () =>
      import('@/views/profile/index.vue'),
    name: 'Profile',
    meta: { title: 'profile', icon: 'user', noCache: true }
  }]
}
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    path: '/public',
    component: Layout,
    redirect: '/public/totaldevices',
    alwaysShow: true, // will always show the root menu
    name: 'devgroup',
    meta: {
      title: 'devgroup',
      icon: 'people',
      roles: ['ham'] // you can set roles in root nav
    },
    children: [{
      path: 'totaldevices',
      component: () =>
        import('@/views/pub/device.vue'),
      name: 'totaldevices',
      meta: {
        title: 'totaldevices',
        roles: ['ham']
      }
    },
    {
      path: 'groups',
      component: () =>
        import('@/views/pub/groups.vue'),
      name: 'grouproom',
      meta: {
        title: 'grouproom',
        roles: ['ham']
      }
    },
    {
      path: 'relay',
      component: () =>
        import('@/views/pub/relay.vue'),
      name: 'relay',
      meta: {
        title: 'relay',
        roles: ['ham'] // or you can only set roles in sub nav
      }
    }

    ]
  },

  {
    path: '/renew',
    component: Layout,
    redirect: '/renew/index',
    hidden: true,
    meta: { requiresBilling: true },
    children: [{
      path: 'index',
      component: () =>
        import('@/views/renew/index.vue'),
      name: 'Renew',
      meta: {
        title: 'renew',
        icon: 'money',
        roles: ['ham'],
        requiresBilling: true
      }
    }]
  },

  {
    path: '/setup',
    component: Layout,
    redirect: '/setup/users',
    alwaysShow: true, // will always show the root menu
    name: 'Setup',
    meta: {
      title: 'setup',
      icon: 'edit',
      roles: ['master'] // you can set roles in root nav
    },
    children: [

      {
        path: 'publicgroup',
        component: () =>
          import('@/views/setup/groups.vue'),
        name: 'publicgroup',
        meta: {
          title: 'publicgroup',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },

      {
        path: 'server',
        component: () =>
          import('@/views/setup/server.vue'),
        name: 'server',
        meta: {
          title: 'server',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },

      {
        path: 'users',
        component: () =>
          import('@/views/setup/users.vue'),
        name: 'UserMgr',
        meta: {
          title: 'users',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },
      {
        path: 'register',
        component: () =>
          import('@/views/setup/register.vue'),
        name: 'regMgr',
        meta: {
          title: 'register',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },
      {
        path: 'billing-packages',
        component: () =>
          import('@/views/setup/billing-packages.vue'),
        name: 'BillingPackages',
        meta: {
          title: 'billingPackages',
          roles: ['admin']
        }
      },
      {
        path: 'site-settings',
        component: () =>
          import('@/views/setup/site-settings.vue'),
        name: 'SiteSettings',
        meta: {
          title: 'siteSettings',
          roles: ['admin']
        }
      },
      {
        path: 'roles',
        component: () =>
          import('@/views/setup/role.vue'),
        name: 'Roles',
        meta: {
          title: 'rolemgr',
          roles: ['admin']
        }
      }

    ]
  },

  {
    path: '/server-register',
    component: Layout,
    redirect: '/server-register/index',
    children: [{
      path: 'index',
      component: () =>
        import('@/views/server-register/index.vue'),
      name: 'ServerRegistration',
      meta: { title: 'serverRegistration', icon: 'edit', roles: ['ham'] }
    }]
  },

  {
    path: '/log',
    component: Layout,
    redirect: '/log/operatorlog',
    alwaysShow: true, // will always show the root menu
    name: 'Log',
    meta: {
      title: 'log',
      icon: 'documentation',
      roles: ['admin'] // you can set roles in root nav
    },
    children: [

      {
        path: 'operatorlog',
        component: () =>
          import('@/views/log/operatorlog.vue'),
        name: 'OperatorLog',
        meta: {
          title: 'operatorlog',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      }
    ]
  }

]

const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes,
  scrollBehavior: () => ({ top: 0 })
})

const constantRouteNames = new Set(
  constantRoutes.flatMap(route => [route.name, ...(route.children || []).map(child => child.name)].filter(Boolean))
)

export function resetRouter() {
  router.getRoutes().forEach(route => {
    if (route.name && !constantRouteNames.has(route.name)) {
      router.removeRoute(route.name)
    }
  })
}

export default router
