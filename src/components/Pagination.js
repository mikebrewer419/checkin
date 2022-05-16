import React from 'react'

const Pagination = ({
  pageCount,
  page,
  setPage
}) => {
  return (
    <div className="d-flex align-items-center justify-content-center mb-4">
      {/* <select value={pageSize} onChange={ev => setPageSize(parseInt(ev.target.value))}>
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={15}>15</option>
      </select> */}
      {/* <span className="mx-2">Per page</span> */}
      <ul className="mb-0 d-flex pagination">
        <li onClick={() => setPage(Math.max(page - 1, 0))}>
          {'<'}
        </li>
        <li className="mx-2">
          Page 
          <select className="page-select ml-2 mr-1" onChange={ev => {
            setPage(parseInt(ev.target.value))
          }}>
            {new Array(pageCount).fill().map((_, idx) => {
              return (
                <option value={idx} selected={idx === page}>
                  { idx + 1}
                </option>
              )
            })}
          </select>
          /
          <span className="ml-1">
            {pageCount}
          </span>
        </li>
        <li onClick={() => setPage(Math.min(page + 1, pageCount - 1))}>
          {'>'}
        </li>
      </ul>
    </div>
  )
}

export default Pagination
