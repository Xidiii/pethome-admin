<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <!-- :inline="true" - 行内表单 -->
      <el-form :inline="true">
        <el-form-item>
          <el-input v-model="keyword" placeholder="请输入名称或电话"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="keywordQuery">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="exportExcel">导出</el-button>
        </el-form-item>
        <el-form-item>
          <!-- 默认name="file" -->
          <el-upload class="upload-demo"
                     action="http://localhost:8080/shop/importExcel"
                     list-type="text">
            <el-button type="warning">点击导入</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
    </el-col>
    <!--列表-->
    <!--
      :data="shops" - 绑定的数据[]
      highlight-current-row - 当前行高亮
      v-loading="listLoading" - 加载框/忙等框
      @selection-change="selsChange" - 选项改变
    -->
    <el-table :data="shops" highlight-current-row v-loading="listLoading"
              @selection-change="selsChange" style="width: 100%;">
      <!-- 批量删除：type="selection - 选项 -->
      <el-table-column type="selection" width="25">
      </el-table-column>
      <el-table-column type="index" width="30">
      </el-table-column>
      <el-table-column prop="name" label="店铺名称" width="100">
      </el-table-column>
      <el-table-column prop="tel" label="电话" width="110">
      </el-table-column>
      <el-table-column prop="registerTime" label="入驻时间" width="120">
      </el-table-column>
      <el-table-column prop="address" label="地址" width="220" sortable>
      </el-table-column>
      <el-table-column prop="state" label="状态" width="80" sortable>
        <template slot-scope="scope">
          <span style="color: gold" v-if="scope.row.state==0">待审核</span>
          <span style="color: darkorchid" v-else-if="scope.row.state==1">待激活</span>
          <span style="color: green" v-else-if="scope.row.state==2">审核通过</span>
          <span style="color: red" v-else-if="scope.row.state==3">驳回</span>
        </template>
      </el-table-column>
      <el-table-column prop="logo" label="图标" width="80" >
        <template scope="scope">
          <img :src="scope.row.logo" height="50px">
        </template>
      </el-table-column>
      <el-table-column prop="username" label="店长" width="100" sortable>
      </el-table-column>
      <el-table-column label="操作">
        <template scope="scope">
          <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
          <el-button type="warning" :disabled="scope.row.state!==0" size="small" @click="handleAudit(scope.$index, scope.row)">审核</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <!--
        :disabled="this.sels.length===0" - 当没有选中任何选项就禁用
       -->
      <el-button type="danger" @click="batchRemove"
                 :disabled="this.sels.length===0">批量删除</el-button>
      <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange"
                     :page-size="pageSize" :total="totals" :current-page="currentPage" style="float:right;">
      </el-pagination>
    </el-col>

    <!--添加和修改的对话框-->
    <!--
      :close-on-click-modal="false" - 点击对话外面的区域不关闭对话框
      :model="saveForm" - 绑定表单数据
      :rules="saveFormRules" - 校验规则
      ref="saveForm" - 对话框的名称 - 验证的时候需要用
      auto-complete="off" - 自动完成
    -->
    <el-dialog :title="title" :visible.sync="saveFormVisible" :close-on-click-modal="false">
      <el-form :model="saveForm" label-width="80px" :rules="saveFormRules" ref="saveForm">
        <el-form-item label="店铺名称" prop="name">
          <el-input v-model="saveForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <!-- 如果要校验：必须加prop属性 -->
        <el-form-item label="电话" prop="tel">
          <el-input v-model="saveForm.tel" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="saveForm.address" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="saveForm.state">
            <el-radio class="radio" :label="1">待审核</el-radio>
            <el-radio class="radio" :label="2">待激活</el-radio>
            <el-radio class="radio" :label="3">审核通过</el-radio>
            <el-radio class="radio" :label="4">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="店长">
          <el-select v-model="saveForm.admin_id" placeholder="请选择" clearable>
            <el-option v-for="item in employees"
                       :label="item.username"
                       :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="saveFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="saveSubmit" :loading="saveLoading">提交</el-button>
      </div>
    </el-dialog>

    <!-- 审核模态框 -->
    <el-dialog title="审核店铺" :visible.sync="shopAuditVisible" :close-on-click-modal="false">
      <el-form :model="shopAuditLog" label-width="80px"  ref="shopAuditLogForm">
        <el-form-item label="备注" prop="note">
          <el-input type="textarea" v-model="shopAuditLog.note"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="shopAuditVisible = false">取消</el-button>
        <el-button type="primary" @click.native="auditPass">通过</el-button>
        <el-button type="primary" @click.native="auditReject">驳回</el-button>
      </div>
    </el-dialog>

  </section>
</template>

<script>
export default {
  data() {
    return {
      //分页相关的数据
      shops: [],     //绑定到表格 - 显示列表数据 - 请求完成之后
      totals: 0,          //总数量 - 计算分页栏 -  请求完成之
      currentPage: 1,     //当前页 - 分页栏默认当前页显示
      pageSize: 5,        //每页显示的条数  - 计算分页栏
      listLoading: false, //表格上的加载框

      //高级查询的参数
      keyword: '', //关键字查询

      //批量删除的数据
      sels: [],//列表选中列 - 用于装选中的对象

      //添加或修改的相关数据
      saveFormVisible: false,  //对话框是否显示：默认不显示
      saveLoading: false,      //对话框中的加载框/忙等框
      title: '',              //标题
      saveFormRules: {        //校验规则
        name: [
          //在失去焦点的时候，校验name是否为空，如果为空，就会显示红色的请输入店铺的编号
          { required: true, message: '请输入店铺的名称', trigger: 'blur' }
        ],
        tel: [
          //在失去焦点的时候，校验name是否为空，如果为空，就会显示红色的请输入店铺的名称
          { required: true, message: '请输入店铺的电话', trigger: 'blur' }
        ],
      },
      //编辑界面数据
      saveForm: {
        id: null,
        name: '',
        tel: '',
        state: 1,
        address: '',
        admin_id: null,
        employee: null
      },

      //店长
      employees: [],
      //审核模态框
      shopAuditVisible: false,
      //编辑界面数据
      shopAuditLog: {
        shopId: null,
        note: ''
      }

    }
  },
  methods: {
    //1.分页查询：获取店铺列表
    getShops() {
      //传递的参数
      let para = {
        //分页参数
        page: this.currentPage,
        sizi: this.pageSize,
        //高级查询参数 - 关键字
        keyword: this.keyword
      };
      //页面一加载就显示加载框
      this.listLoading = true;
      this.$http.post("/shop/findPage",para).then(res => {
        console.log(res)
        //赋值总数量
        this.totals = res.data.object.total;
        //当前页的数据
        this.shops = res.data.object.data;
        //关闭加载框
        this.listLoading = false;
      }).catch(res => {
        this.$message.error('系统繁忙，请稍后重试!!!');
      })
    },

    //2.点击某一页触发的方法
    handleCurrentChange(val) {
      //当前页
      this.currentPage = val;
      this.getShops();
    },

    //3.关键字查询
    keywordQuery(){
      //关键字查询从第一页开始显示
      this.currentPage = 1;
      this.getShops();
    },

    //4.删除
    handleDel: function (index, row) {
      this.$confirm('确认删除该记录吗?', '温馨提示', {
        type: 'warning'
      }).then(() => { //点击确认之后要执行的代码
        //显示加载框
        this.listLoading = true;
        //获取id
        var id = row.id;
        this.$http.delete("/shop/"+id).then(res => {
          if(res.data.success){//删除成功
            this.$message.success('删除成功'); //3s自动消失

            //如果时最后一页并且是最后一条数据的时候：当前页 = 当前页-1
            //最后一条数据：(this.totals - 1)%this.pageSize == 0
            //总页数：Math.ceil(this.totals/this.pageSize)
            var totalPage = Math.ceil(this.totals/this.pageSize);
            if(totalPage==this.currentPage && this.currentPage>1 && (this.totals - 1)%this.pageSize == 0){
              this.currentPage = this.currentPage - 1;
            }

            this.getShops();
          }else{
            this.$message.error('系统繁忙，请稍后重试【500】');
          }
          this.listLoading = false;//关闭加载框
        }).catch(res => {
          this.$message.error('系统繁忙，请稍后重试【400,404】');
        })
      }).catch(() => { //点击取消之后要执行的代码
      });
    },

    //5.选项改变的时候触发
    selsChange: function (sels) {
      //获取被选中的对象  - 集合
      this.sels = sels;
    },

    //6.批量删除
    batchRemove: function () {
      //获取被选中对象的id们
      var ids = this.sels.map(item => item.id); //[1,2,3]
      this.$confirm('确认删除选中记录吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.listLoading = true;
        this.$http.post("/shop/bulkDeletion",ids).then(res => {
          if(res.data.success){//删除成功
            this.$message.success('删除成功'); //3s自动消失
            this.getShops();
          }else{
            this.$message.error('系统繁忙，请稍后重试【500】');
          }
          this.listLoading = false;//关闭加载框
        }).catch(res => {
          this.$message.error('系统繁忙，请稍后重试【400,404】');
        })
      }).catch(() => {
      });
    },

    //7.点击添加按钮弹出对话框
    handleAdd: function () {
      this.saveForm = {
        id: null,
        name: '',
        tel: '',
        state: 1,
        address: '',
        admin_id: null,
        employee: null
      };
      this.title = " 添 加 ";
      //获取店长
      this.getEmployees();
      //获取店铺树
      //显示对话框
      this.saveFormVisible = true;
    },

    //8.点击编辑按钮弹出对话框
    handleEdit: function (index, row) {
      //克隆：防止对象引用修改显示的数据
      this.saveForm = Object.assign({}, row);
      this.title = " 修 改 ";
      //获取店长
      this.getEmployees();

      //显示对话框
      this.saveFormVisible = true;
    },

    //9.点击提交按钮添加或修改数据
    saveSubmit: function () {
      //所有对话框中  一个名称为 saveForm的对话框  验证【上面的验证规则通过了 - 返回true，否则返回false】
      this.$refs.saveForm.validate((valid) => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            this.saveLoading = true;
            let para = Object.assign({}, this.saveForm);

            this.$http.put("/shop/saveAndUpdate",para).then(res => {
              if(res.data.success){
                this.$message.success("操作成功");
                this.getShops();
              }else{
                this.$message.error("系统繁忙，请稍后重试【500】")
              }
              this.saveLoading = false;
              this.saveFormVisible = false;
            }).catch(res => {
              this.$message.error("系统繁忙，请稍后重试【400,404】")
            })
          });
        }
      });
    },

    //10.获取所有部门 - 店铺所属部门可以选择
    getEmployees(){
      this.$http.get("/emp/select").then(res => {
        console.log(res)
        //给店铺经理们赋值
        this.employees = res.data.object;
        console.log(this.employees)
      })
    },

    //11.点击店铺审核弹出对话框
    handleAudit(index,row){
      //给店铺Id赋值
      this.shopAuditLog.shopId = row.id;
      //显示审核对话框
      this.shopAuditVisible = true;
    },

    //12.点击通过发送请求
    auditPass(){
      this.$http.post("/shop/audit/pass",this.shopAuditLog).then(res=>{
        this.shopAuditVisible = false;
        if(res.data.success){
          this.$message.success("审核成功!!!");
          this.getShops();
        }else{
          this.$message.error("系统繁忙，请稍后重试!!![500]");
        }
      }).catch(res=>{
        this.$message.error("系统繁忙，请稍后重试!!![400,404]")
      })
    },

    //13.点击驳回发送请求
    auditReject(){
      this.$http.post("/shop/audit/reject",this.shopAuditLog).then(res=>{
        this.shopAuditVisible = false;
        if(res.data.success){
          this.getShops();
        }else{
          this.$message.error("系统繁忙，请稍后重试!!![500]");
        }
      }).catch(res=>{
        this.$message.error("系统繁忙，请稍后重试!!![400,404]")
      })
    },

    //14.导出
    exportExcel(){
      location.href="http://localhost:8080/shop/export"; //get
    }
  },
  mounted() {
    this.getShops();
    this.getEmployees();
  }
}

</script>

<style scoped>
</style>