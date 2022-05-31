import React, {
  useState,
  useEffect,
  useReducer
} from 'react'
import {Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import { getGoogleCalendarEvents } from '../../../services'
import { toggleLoadingState } from '../../../utils'

const initialState = [];

function reducer(state, action) {
  switch (action.type) {
    case 'add':
      const newEvents = action.payload.filter(itNew => state.findIndex(itOld=>itOld.id === itNew.id) === -1)
      return [...state, ...newEvents];
  }
}

const CalendarTab = () => {
  const [events, dispatch] = useReducer(reducer, initialState)

  const loadEvents = async (dateRange) => {
    const res = await getGoogleCalendarEvents(dateRange)
    if (Array.isArray(res)){
      res.forEach(it => {
        it.start = new Date(!!it.start.dateTime ? it.start.dateTime : it.start.date)
        it.end = new Date(!!it.end.dateTime ? it.end.dateTime : it.end.date)
        it.title = it.summary
      })
      dispatch({type: 'add', payload: res})
    }
  }
  
  const onDateRangeChange = async (range) => {
    let dateRange = null
    if (Array.isArray(range)) {
      const endDate = range[range.length - 1]
      dateRange = {
        start: range[0],
        end: endDate
      }
    } else {
      dateRange = range
    }

    dateRange.start = dateRange.start.toISOString()
    dateRange.end = dateRange.end.toISOString()

    toggleLoadingState(true)
    await loadEvents(dateRange)
    toggleLoadingState(false)
  }
  useEffect(() => {
    const dateRange = {}
    let a = new Date
    a.setDate(1)
    a.setDate(1 - a.getDay())
    dateRange.start = a.toISOString()
    a = new Date
    a.setDate(1)
    a.setMonth(a.getMonth() + 1)
    a.setDate(0)
    a.setDate(a.getDate() + 7 - a.getDay())
    dateRange.end = a.toISOString()
    toggleLoadingState(true)
    loadEvents(dateRange).then((res) => {
      toggleLoadingState(false)
    })
  }, [])
  const localizer = momentLocalizer(moment)
  return (
    <div className="admin-events-calendar-container">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onRangeChange={onDateRangeChange}
      />
    </div>
  )
}
export default CalendarTab