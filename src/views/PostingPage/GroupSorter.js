import React, { useState } from 'react'
import { Modal } from 'react-bootstrap'
import { FaListUl } from 'react-icons/fa'
import { sortable } from 'react-sortable'

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

const GroupSorter = ({ groups, update }) => {
  const [show, setShow] = useState(false)
  const [items, setItems] = useState(groups)
  return (
    <div>
      <button
        className="btn btn-primary mr-3"
        onClick={() => setShow(true)}
      >
        <FaListUl className="mr-2 mt-n1" />
        Sort Groups
      </button>
      <Modal
        show={show}
        onHide={() => setShow(false)}
      >
        <Modal.Header closeButton>
          <h5 className="mb-0">
            Sort Groups
          </h5>
        </Modal.Header>
        <Modal.Body>
          {show && (
            <SortableList
              items={groups}
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
