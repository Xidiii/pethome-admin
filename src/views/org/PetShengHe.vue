<template>
    <div style="margin-top: 20px">
      <el-form size="mini" :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="关键字">
          <el-input v-model="searchForm.keyword" placeholder="关键字（标题或地址）"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.state" placeholder="审核状态">
            <el-option label="待审核" value="0"></el-option>
            <el-option label="审核通过" value="1"></el-option>
            <el-option label="驳回" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="发布时间">
          <el-date-picker
              v-model="searchForm.betweenTime"
              type="daterange"
              value-format="yyyy-MM-dd"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="toQuery">查询</el-button>
          <el-button type="danger" @click="patchDel">批量删除</el-button>
        </el-form-item>
      </el-form>
      <el-table
          :data="tableData"
          border
          style="width: 100%;"
          @selection-change="handleSelectionChange">
        <el-table-column
            type="selection"
            width="55">
        </el-table-column>
        <el-table-column
            prop="resourcesStr"
            label="宠物图片">
          <template slot-scope="scope">
            <el-image :src="scope.row.resources"
                      :preview-src-list="[scope.row.resources]"></el-image>
          </template>
        </el-table-column>
        <el-table-column
            prop="title"
            label="标题">
        </el-table-column>
        <el-table-column
            prop="state"
            label="状态">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.state == 0" type="info">待审核</el-tag>
            <el-tag v-if="scope.row.state == 1" type="warning">审核通过</el-tag>
            <el-tag v-if="scope.row.state == 2" type="danger">审核驳回</el-tag>
          </template>
        </el-table-column>
        <el-table-column
            prop="age"
            label="年龄">
        </el-table-column>
        <el-table-column
            prop="gender"
            label="性别">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.gender == 0" type="info">母</el-tag>
            <el-tag v-if="scope.row.gender == 1" type="warning">公</el-tag>
          </template>
        </el-table-column>
        <el-table-column
            prop="coatColor"
            label="毛色">
        </el-table-column>
        <el-table-column
            prop="petTypeName"
            label="类型">
        </el-table-column>
        <el-table-column
            prop="price"
            label="价格">
        </el-table-column>
        <el-table-column
            prop="address"
            label="地址">
        </el-table-column>

        <el-table-column label="操作" width="150px">
          <template slot-scope="scope">
            <el-button
                size="mini"
                @click="handleEdit(scope.$index, scope.row)">编辑
            </el-button>
            <el-button v-if="scope.row.state == 0"
                       size="mini"
                       type="danger"
                       @click="handlerShenghe(scope.$index, scope.row)">审核
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
          style="margin-top: 20px"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="searchForm.page"
          :page-sizes="[5, 10, 15, 20]"
          :page-size="searchForm.size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>


      <el-dialog title="审核操作" :visible.sync="dialogFormVisible">
        <el-form :model="form">
          <el-form-item label="标题" label-width="100px">
            <el-input v-model="form.title" disabled></el-input>
          </el-form-item>
          <el-form-item label="审核备注" label-width="100px">
            <el-input
                type="textarea"
                placeholder="请输入内容"
                v-model="form.note"
                maxlength="200"
                show-word-limit
            >
            </el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="shenghe(1)">审核通过</el-button>
          <el-button @click="shenghe(2)">审核驳回</el-button>
        </div>
      </el-dialog>
    </div>
  </template>

  <script>
    export default {
      name: "PetShengHe",
      data() {
        return {
          form: { //下面的3个属性，可省略
            id: '',//审核的数据的主键 ID
            title: '', //显示的标题
            note: '', //备注,
            state: null, //审核状态
            token: sessionStorage.getItem("token") //令牌
          },
          dialogFormVisible: false,
          total: 0, //总记录数
          multipleSelection: [],
          searchForm: {
            page: 1,
            size: 10
          },
          tableData: []
        }
      },
      methods: {
        shenghe(state) {
          this.form.state = state;
          this.$http.post('/searchmaster/shenghe', this.form).then(res => {
            let {msg, success} = res.data;
            if (success) {
              this.dialogFormVisible = false;
              this.toQuery();
            } else {
              this.$message.error(msg);
            }
          })
        },
        toQuery() {
          if (this.searchForm.betweenTime && this.searchForm.betweenTime.length > 0) {//判断参数非空（!= '' && != underfind && != NAN）
            //this.searchForm.betweenTime = this.searchForm.betweenTime.join(",");
            this.searchForm.startTime = this.searchForm.betweenTime[0]
            this.searchForm.endTime = this.searchForm.betweenTime[1]
          }
          console.log("选择的时间：" + JSON.stringify(this.searchForm));
          let para = {
            //分页参数
            page: this.searchForm.page,
            sizi: this.searchForm.size,
          };
          this.$http.post("/searchmaster/findPage", para).then(res => {
            console.log(this.searchForm);
            console.log(res)
            this.tableData = res.data.object.data;
            this.total = res.data.object.total;
          })
        },
        handleEdit(index, row) {
          console.log(index, row);
        },
        handlerShenghe(index, row) {
          console.log(index, row);
          this.dialogFormVisible = true;
          //TODO 下面的这个操作 ，是直接当前这一整行的数据，赋值给了form
          //而form对应在后台实体类的 TSearchMasterMsg对象
          // this.form = row;
          this.form.title = row.title;
          this.form.id = row.id;

        },
        handleSizeChange(val) {
          this.searchForm.size = val;
          this.toQuery();
        },
        handleCurrentChange(val) {
          this.searchForm.page = val;
          this.toQuery();
        },
        handleSelectionChange(val) {
          this.multipleSelection = val;
        }
      },
      mounted() {
        this.toQuery();
      }
    }
  </script>

  <style scoped>

  </style>