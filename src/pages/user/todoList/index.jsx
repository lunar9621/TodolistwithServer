import { Input, Form, Table, Radio, Popconfirm, Button, message } from 'antd';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import React, { Component } from 'react';
import { Link } from 'umi';
import { connect } from 'dva';
import EditableCell from './components/EditableCell';
import styles from './style.less';
const { Search } = Input;
const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);
@Form.create()
class TodoList extends Component {

  state = {
    selectedRowKeys: [],
    status: 0,
  };
  columns = [{
    title:'事件名称',
    align:'center',
    dataIndex: 'name',
    width: '60%',
    editable: true,
  },
  {
    title:'操作',
    align:'center',
    dataIndex: 'operation',
    width: '20%',
    render: (text, record) =>
      this.props.eventList && this.props.eventList.length > 0 ? (
        <Popconfirm title={formatMessage({
          id: 'Sure to delete?',
        })} onConfirm={() => this.handleDelete(record.index)}>
          <a><FormattedMessage id="Delete" /></a>
        </Popconfirm>
      ) : null,
  }]

  componentDidMount() {
    let { dispatch} = this.props;
    let tmpselectedRowKeys = [], flag = 0;
    dispatch({
      type: 'todos/fetchEventList',
      payload: 0,
      callback: () => {
        let {eventList}=this.props;
        for (let i = 0; i < eventList.length; i++) {
          if (eventList[i].done === true) {
            tmpselectedRowKeys.push(flag);
          }
          flag++;
        }
        this.setState({
          selectedRowKeys: tmpselectedRowKeys,
        });
      }
    })
  }

  handleDelete = indexID => {
    const { dispatch } = this.props;
    let params = {
      index: indexID
    }
    if (dispatch) {
      dispatch({
        type: 'todos/deleteEvent',
        payload: params,
        callback: () => {
          const { success, msg } = this.props.datachange;
          console.log("confirmmsg" + msg);
          if (success) {
            message.success(formatMessage({
              id: 'delete-event-success',
            }));
            this.reloadHandler(dispatch);
          } else {
            message.error(msg);
          }
        },
      });
    }
  };

  reloadHandler = (dispatch) => {
    let { status } = this.state;
    let tmpselectedRowKeys = [], flag = 0;
    dispatch({
      type: 'todos/fetchEventList',
      payload: status,
      callback: () => {
        let { eventList } = this.props;
        for (let i = 0; i < eventList.length; i++) {
          if (eventList[i].done === true) {
            tmpselectedRowKeys.push(flag);
          }
          flag++;
        }
        console.log("tmpselectedkeys",tmpselectedRowKeys);
        this.setState({
          selectedRowKeys: tmpselectedRowKeys,
        });
      }
    })

  }

  addEvent = value => {
    let { dispatch, eventList } = this.props;
    let maxIndex = eventList.length != 0 ? eventList[eventList.length - 1].index + 1 : 0;
    let params = {
      index: maxIndex,
      name: value,
      done: false,
    }
    if (dispatch) {
      dispatch({
        type: 'todos/addEvent',
        payload: params,
        callback: () => {
          const { success, msg } = this.props.datachange;
          console.log("confirmmsg" + msg);
          if (success) {
            message.success(formatMessage({
              id: 'add-event-success',
            }));
            this.reloadHandler(dispatch);
          } else {
            message.error(msg);
          }
          this.props.form.resetFields(['input']);
        },
      });
    }
  }

  handleSave = row => {
    const { dispatch } = this.props;
    let params = {
      index: row.index,
      name: row.name,
    }
    if (dispatch) {
      dispatch({
        type: 'todos/updateEvent',
        payload: params,
        callback: () => {
          const { success, msg } = this.props.datachange;
          console.log("confirmmsg" + msg);
          if (success) {
            message.success(formatMessage({
              id: 'update-event-success',
            }));
            this.reloadHandler(dispatch);
          } else {
            message.error(msg);
          }
        },
      });
    }
  };

  onChange = e => {
    console.log(`radio checked:${e.target.value}`);
    let { dispatch} = this.props;
    let tmpselectedRowKeys = [], flag = 0;
    let status;
    if (e.target.value == 'a') {
      status = 0;
    } else if (e.target.value == 'b') {
      status = 1;
    } else {
      status = 2;
    }
    dispatch({
      type: 'todos/fetchEventList',
      payload: status,
      callback: () => {
        let { eventList } = this.props;
        for (let i = 0; i < eventList.length; i++) {
          console.log("i",eventList[i]);
          if (eventList[i].done === true) {
            tmpselectedRowKeys.push(flag);
          }
          flag++;
        }
        console.log("tmpselected",tmpselectedRowKeys);
        this.setState({
          selectedRowKeys: tmpselectedRowKeys,
          status,
        });
      }
    })
  }

  onSelectChange = (record, selected, selectedRows, nativeEvent) => {
    console.log(`record:${record} selected:${selected}`);
    const { dispatch } = this.props;
    let params;
    if (selected) {
      params = {
        index: record.index,
        selected: true,
      }
    } else {
      params = {
        index: record.index,
        selected: false,
      }
    }
    dispatch({
      type: "todos/changeDoneStatus",
      payload: params,
      callback: () => {
        const { success, msg } = this.props.datachange;
        console.log("confirmmsg" + msg);
        if (success) {
          message.success(formatMessage({
            id: 'change-eventstatus-success',
          }));
          this.reloadHandler(dispatch);
        } else {
          message.error(msg);
        }
      },
    })
  }

  clearCompleted = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'todos/clearCompleted',
      callback: () => {
        const { success, msg } = this.props.datachange;
        console.log("confirmmsg" + msg);
        if (success) {
          message.success(formatMessage({
            id: 'clear-completed-success',
          }));
          this.reloadHandler(dispatch);
        } else {
          if(msg=="暂无已完成事件")
          {
            message.error(formatMessage({
              id: 'No completed events',
            }));
          }else{
          message.error(msg);
          }
        }
      },
    })
  }

  render() {
    const { selectedRowKeys } = this.state;
    const { eventList, loading,activeLength,completedLength } = this.props;
    const { getFieldDecorator } = this.props.form;
    console.log("render", eventList);
    const rowSelection = {
      selectedRowKeys,
      columnTitle: '完成情况',
      columnWidth: '20%',
      onSelect: this.onSelectChange,
      getCheckboxProps: record => ({
        done: false,
      }),
    };
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };
    const columns = this.columns.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave,
        }),
      };
    });
    return (
      <div className={styles.main}>
        <Form>
          <div className={styles.InputBlock}>
            <Form.Item className={styles.FormItem}>
              {getFieldDecorator('input')(
                <Search
                  placeholder={formatMessage({
                    id: 'What-needs-to-be-done',
                  })}
                  enterButton={formatMessage({
                    id: 'Add',
                  })}
                  size="large"
                  onSearch={value => this.addEvent(value)}
                />)}
            </Form.Item>
          </div>
          <div className={styles.OperationBlock} >
            <div className={styles.StatusBlock}>
              <Radio.Group onChange={this.onChange} defaultValue="a">
                <Radio.Button value="a"><FormattedMessage id="All" />({activeLength+completedLength})</Radio.Button>
                <Radio.Button value="b"><FormattedMessage id="Active" />({activeLength})</Radio.Button>
                <Radio.Button value="c"><FormattedMessage id="Completed" />({completedLength})</Radio.Button>
              </Radio.Group>
            </div>
            <div className={styles.ClearBlock}>
              <Popconfirm title={formatMessage({
                id: 'Sure to clear completed event?',
              })} onConfirm={this.clearCompleted}>
                <Button> <FormattedMessage id="clearCompleted" /></Button>
              </Popconfirm>
            </div>
          </div>
          <div class={styles.ListBlock} >
            <Table
              components={components}
              rowClassName={() => 'editable-row'}
              bordered={false}
              pagination={false}
              scroll={{ y: 300 }}
              dataSource={eventList}
              columns={columns}
              rowSelection={rowSelection}
            />
          </div>
        </Form>
      </div>
    );
  }
}


export default connect(({ todos }) => ({
  eventList: todos.eventList.obj,
  activeLength:todos.eventList.activeLength,
  completedLength:todos.eventList.completedLength,
  datachange: todos.datachange,
  loading: todos.loading,
}))(TodoList)


