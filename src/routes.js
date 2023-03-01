import Login from './views/Login.vue'
import NotFound from './views/404.vue'
import echarts from './views/charts/echarts.vue'
import Home from "./views/Home";
import Department from "./views/org/Department";


let routes = [
    {
        path: '/',
        component: Home,
        name: '首页',
        leaf: true,//只有一个节点
        iconCls: 'el-icon-s-home',
        children: [
            { path: '/echarts', component: echarts, name: '首页'}
        ]
    },
    {
        path: '/',
        component: Home,
        name: '组织机构',
        iconCls: 'el-icon-s-grid',//图标样式class
        children: [
            { path: '/department', component: Department, name: '部门管理' }
        ]
    },
    {
        //前端访问路径
        path: '/login',
        //对应的组件或者叫模板
        component: Login,
        //模板展示的名字
        name: 'Login',
        //hidden 隐藏
        hidden: true
    },
    {
        path: '/404',
        component: NotFound,
        name: '',
        hidden: true
    },
    {
        path: '*',
        hidden: true,
        redirect: { path: '/404' }
    }
];

export default routes;