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
    dataIndex: 'name',
    width: '60%',
    editable: true,
  },
  {
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
    const { dispatch, eventList } = this.props;
    let tmpselectedRowKeys = [], flag = 0;
    dispatch({
      type: 'todos/fetchEventList',
      payload: 0,
      callback: () => {
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
    const { status } = this.state;
    const { eventList } = this.props;
    let tmpselectedRowKeys = [], flag = 0;
    dispatch({
      type: 'todos/fetchEventList',
      payload: status,
      callback: () => {
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

  addEvent = value => {
    const { dispatch, eventList } = this.props;
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
    const { dispatch, eventList } = this.props;
    let tmpselectedRowKeys = [], flag = 0;
    let status;
    if (e.target.value == 'a') {
      status = 0;
    } else if (e.target.value == 'b') {
      status = 1;
    } else {
      status = 2;
    }
    this.setState({
      status,
    });
    dispatch({
      type: 'todos/fetchEventList',
      payload: status,
      callback: () => {
        for (let i = 0; i < eventList.length; i++) {
          if (this.props.eventList[i].done === true) {
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
          message.error(msg);
        }
      },
    })
  }

  render() {
    const { selectedRowKeys } = this.state;
    const { eventList, loading } = this.props;
    const { getFieldDecorator } = this.props.form;
    console.log("render", eventList);
    const rowSelection = {
      selectedRowKeys,
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
          <Form.Item style={{ margin: 0 }}>
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
          <Table
            loading={loading}
            components={components}
            rowClassName={() => 'editable-row'}
            showHeader={false}
            bordered={false}
            pagination={false}
            scroll={{ y: 400 }}
            dataSource={eventList}
            columns={columns}
            rowSelection={rowSelection}
          />
          <span>{eventList.length}<FormattedMessage id="items-left" /></span>
          <Radio.Group onChange={this.onChange} defaultValue="a" style={{ display: 'inline-block', marginLeft: "10px" }}>
            <Radio.Button value="a"><FormattedMessage id="All" /></Radio.Button>
            <Radio.Button value="b"><FormattedMessage id="Active" /></Radio.Button>
            <Radio.Button value="c"><FormattedMessage id="Completed" /></Radio.Button>
          </Radio.Group>
          <Button onClick={this.clearCompleted} style={{ display: 'float', float: 'right' }}>
            <FormattedMessage id="clearCompleted" />
          </Button>
        </Form>
      </div>
    );
  }
}


export default connect(({ todos }) => ({
  eventList: todos.eventList.obj,
  datachange: todos.datachange,
  loading: todos.loading,
}))(TodoList)


