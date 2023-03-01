<template>
    <section>
        <!--工具条-->
      <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
        <el-form :inline="true" :model="filters">
          <el-form-item>
            <el-input v-model="filters.name" placeholder="部门名称"></el-input>
          </el-form-item>
          <el-form-item>
            <!--
v-for="变量名 in 数据源"  -- 遍历
:label :展示的列表
:value :获取的值
-->
            <el-select v-model="filters.managerId" clearable placeholder="请选择项目经理">
              <el-option
                  v-for="item in managers"
                  :label="item.username"
                  :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <!--
v-for="变量名 in 数据源"  -- 遍历
:label :展示的列表
:value :获取的值,传递到后台的
-->
            <el-select v-model="filters.parentId" clearable placeholder="请选择父级部门">
              <el-option
                  v-for="item in parentDepts"
                  :label="item.name"
                  :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" v-on:click="loadList">查询</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleAdd">新增</el-button>
          </el-form-item>
        </el-form>
      </el-col>
        <!--
            :   v-bind
            :data: 数据源
            @   v-on
        -->
        <el-table :data="dept" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
                  style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" width="60" label="编号">
            </el-table-column>
            <el-table-column prop="name" label="部门名称" width="120" sortable>
            </el-table-column>
            <el-table-column prop="state" label="状态" width="100" :formatter="formatSex" sortable>
                <template slot-scope="scope">
                    <el-button type="text" size="small"
                               :type="scope.row.state ==0?'danger':'primary'">
                        {{scope.row.state == 0 ? "禁用" : "启用"}}
                    </el-button>
                </template>
            </el-table-column>
            <el-table-column prop="sn" label="部门编号" width="100" sortable>
            </el-table-column>
            <el-table-column prop="managerName" label="部门经理" width="100" sortable>
            </el-table-column>
            <el-table-column prop="parentName" label="上级部门" width="100" sortable>
            </el-table-column>
            <el-table-column label="操作" width="150">
                <template slot-scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.row.id)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!--分页组件-->
        <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="page"
                :page-sizes="[5, 10, 20, 50]"
                :page-size="sizi"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">

        </el-pagination>
      <el-button type="danger" :disabled="this.sels.length===0" @click="delBatch">批量删除</el-button>

        <!--新增和修改的模态框-->
        <el-dialog title="操作" :visible.sync="addFormVisible" :close-on-click-modal="false">
            <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
                <el-form-item label="部门名称" prop="name">
                    <el-input v-model="addForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="部门编号" prop="sn">
                    <el-input v-model="addForm.sn" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="部门状态" prop="state">
                    <el-switch
                            v-model="state"
                            active-text="启用"
                            inactive-text="禁用">
                    </el-switch>
                </el-form-item>
                <!--
                    v-for="变量名 in 数据源"  -- 遍历
                    :label :展示的列表
                    :value :获取的值,传递到后台的
                    -->
                <el-form-item label="部门经理">
                    <el-select v-model="addForm.managerId" clearable placeholder="请选择">
                        <el-option
                                v-for="item in employees"
                                :label="item.username"
                                :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="上级部门">
                    <!--:options="treeDepts" ：数据源
                        props：属性
                        v-model:前面没有冒号
                    -->
                    <el-cascader
                            v-model="addForm.parentIds"
                            :options="treeDepts"
                            :props="{ checkStrictly: true,value:'id',label:'name' }"
                            clearable></el-cascader>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="addFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
            </div>
        </el-dialog>
    </section>
</template>

<script>
    export default {
        name: "Department",
        data(){
            return{
                dept: [],           // 部门数据源
                listLoading: false,     // 加载动画
                sels: [], //存放删除id
                state: false,       // 模态框的开关状态
                page: 1,    // 页码
                sizi: 5,    // 每页条数
                total: 0,    // 分页总条数

              filters: {
                name: "",
                managerId: "",
                parentId: "",
              },

               addFormVisible: false,         // 控制模态框的开启和关闭
                // 表单的属性数据
                addForm: {
                    sn: "",
                    name: "",
                    managerId: "",
                    parentIds: "",
                },
                employees: [],            // 存储部门经理的书数据
                treeDepts: [],
                addFormRules: {
                    name: [
                        /*
                                            required(必须): true,
                                            trigger（触发条件）: 'blur（光标移开触发）'
                                        */
                        {required: true, message: '请输入部门名称', trigger: 'blur'}
                    ],
                    sn: [
                        /*
                                        required(必须): true
                                        trigger（触发条件）: 'blur（光标移开触发）'：
                                   */
                        {required: true, message: '请输入部门编号', trigger: 'blur'}
                    ]
                },
              managers: [],
              parentDepts: []
            }
        },
        methods: {
            // 数据格式化
            formatSex(){

            },
            // 分页的每页条数选择事件
            handleSizeChange(val){
                this.sizi = val;
                this.loadList();    // 重写发请求
            },
            // 分页的页码选择事件
            handleCurrentChange(val){
                this.page = val;
                this.loadList();    // 重写发请求
            },
            // 表格多选事件
            selsChange(val){
              this.sels = [];
              if(val != null && val.length > 0){
                for(var i=0; i<val.length; i++){
                  //往sels数组中存值
                  this.sels.push(val[i].id);
                }
              }
            },
            // 修改按钮事件
            handleEdit(index,row){
              this.addFormVisible = true;
              console.log(row)
              this.addForm = Object.assign({},row)
              console.log(!this.addForm.state)
              this.state = !!this.addForm.state
              let dirPath = row.dirPath;
              if(dirPath){
                let paths = dirPath.split("/");
                paths = paths.splice(1,paths.length-2);
                console.log(paths)
                paths = paths.map(Number);
                this.addForm.parentIds = paths;
              }
              this.loadList();
              this.getTreeDept();
            },
            addSubmit(){
              // 数据校验
              this.$refs.addForm.validate(valid => {
                console.log("校验规则")
                console.log(valid);
                if(valid) {
                  // 弹出确认提交的提示框
                  this.$confirm('确认提交吗？', '提示', {}).then(() => {
                    this.addForm.state = this.state ? 0 : 1;
                    this.$http.post("/dept/save",this.addForm).then(res => {
                      console.log(res)
                      this.addFormVisible = false;     // 关闭模态框
                      this.loadList();        // 重新加载数据
                    });
                  })
                }
              });
            },
            // 新增按钮事件
            handleAdd(){
                this.addFormVisible = true;          // 弹出模态框
                this.addForm = Object.assign({},{})
            },
            // 删除按钮事件
            handleDel(row){
              console.log(row)
              this.$http.delete("/dept/"+row).then(result=>{
                if(result.data.success){
                  this.$message({
                    type: 'success',
                    message: result.data.message
                  });
                }else{
                  this.$message({
                    type: 'error',
                    message: result.data.message
                  });
                }
              })
              this.loadList();
            },


            //批量删除
          delBatch(){
            this.$confirm('确定删除这些数据吗？', '请确认', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              let param = {
                "ids": this.sels
              };
              console.log(param)
              this.$http.post("/dept/deleteAll", param).then(result=>{
                if(result.data.success){
                  this.$message({
                    type: 'success',
                    message: result.data.message
                  });
                }else{
                  this.$message({
                    type: 'error',
                    message: result.data.message
                  });
                }
              });
            }).catch(() => {
              this.$message({
                type: 'info',
                message: '已取消操作'
              });
            });
            this.loadList();
          },
            // 获取后端部门数据
            loadList(){
                // 封装请求数据
                let param = {
                    "page": this.page,
                    "sizi": this.sizi,
                    "name": this.filters.name,
                    "managerId": this.filters.managerId,
                    "parentId": this.filters.parentId,
                }
                // 发送请求
                this.$http.post("/dept/findPage",param).then(res => {
                    console.log("后端部门数据")
                    console.log(res)
                    this.dept = res.data.object.data;
                    this.total = res.data.object.total;
                })
            },
            // 查询所有员工的数据
            getAllEmp(){
                this.$http.get("/emp/select").then(res => {
                  console.log(res)
                    this.employees = res.data.object;
                })
            },

            getmanagers(){
              this.$http.get("/emp/managers").then(res => {
                console.log(res)
                this.managers = res.data.object;
              })
            },
            getTreeDept(){
              this.$http.post("/dept/treeDept").then(res => {
                console.log("无限极数据")
                console.log(res)
                this.treeDepts = res.data.object
              })
            },
            getparentDepts(){
              this.$http.post("/dept/parentDepts").then(res => {

                console.log(res)
                this.parentDepts = res.data.object
              })
            }
        },
        mounted() {
            // 加载后端数据
            this.loadList();
            // 获取所有员工信息
            this.getAllEmp();
            //无限极树
            this.getTreeDept();

            this.getmanagers();

            this.getparentDepts();
        }
    }
</script>

<style scoped>

</style>