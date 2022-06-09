import React, { useState } from 'react'
import { Modal } from 'react-bootstrap'
import { FaListUl } from 'react-icons/fa'
import { sortable } from 'react-sortable'
import {
  static_root,
} from '../../services'

class Item extends React.Component {
  render() {
    return (
      <li className="list-group-item" {...this.props}>
        {this.props.children}
      </li>
    )
  }
}

var SortableItem = sortable(Item)

class SortableList extends React.Component {
 
  state = {
    items: this.props.items
  }
 
  onSortItems = (items) => {
    this.setState({
      items: items
    })
    if (this.props.update) {
      this.props.update(items)
    }
  }
 
  render() {
    const { items } = this.state
    var listItems = items.map((item, i) => {
      return (
        <SortableItem
          key={item._id}
          onSortItems={this.onSortItems}
          items={items}
          sortId={i}
        >
          {i + 1}: {item.name}
          {this.props.showThumbnail && (
            <img
              className="dummy-player dummy-video ml-5"
              src={static_root+item.thumbnail}
            />
          )}
        </SortableItem>
      )
    })
 
    return (
      <ul className='sortable-list list-group'>
        {listItems}
      </ul>
    )
  }
}

const GroupSorter = ({ groups, update, title='Sort Group', showThumbnail, btnClass='', btnContent = null }) => {
  const [show, setShow] = useState(false)
  const [items, setItems] = useState(JSON.parse(JSON.stringify(groups)))
  return (
    <div className='group-sorter'>
      <button
        className={"btn btn-primary " + btnClass}
        onClick={() => {
          setShow(true)
          setItems(JSON.parse(JSON.stringify(groups)))
        }}
      >
        {btnContent ? btnContent : [
          <FaListUl key="icon" className="mr-2 mt-n1" />,
          <span key="text">{ title }</span>
        ]}
      </button>
      <Modal
        show={show}
        onHide={() => setShow(false)}
      >
        <Modal.Header closeButton>
          <h5 className="mb-0">
            { title }
          </h5>
        </Modal.Header>
        <Modal.Body>
          {show && (
            <SortableList
              showThumbnail={showThumbnail}
              items={items}
              update={setItems}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-danger"
            onClick={async () => {
              await update(items)
              setShow(false)
            }}
          >
            Update
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default GroupSorter
