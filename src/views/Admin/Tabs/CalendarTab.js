import React, {
  useContext,
  useEffect,
  useReducer,
  useState,
  useRef
} from 'react'
import {Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment-timezone'
import {
  Modal,
  Button,
  Container,
  Row,
  Col
} from 'react-bootstrap'
import {
  getGoogleCalendarEvents,
  getAllSessions
} from '../../../services'
import {ShowLoadingContext} from '../../../Context'
const initialState = [];

function reducer(state, action) {
  switch (action.type) {
    case 'add':
      const newEvents = action.payload.filter(itNew => state.findIndex(itOld=>itOld.id === itNew.id) === -1)
      if (newEvents.length > 0) {
        return [...state, ...newEvents];
      }
      return state
      
  }
}

const eventTypeColors = {
  'session': '#ee514f',
  'google-calendar-event': '#28a745',
  'google-calendar-eventCasting Bookings': '#25354d'
}


const CalendarTab = ({ show }) => {
  const [events, dispatch] = useReducer(reducer, initialState)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const toggleLoadingState = useContext(ShowLoadingContext)
  const calendarRef = useRef(null)
  
  const loadGoogleEvents = async (dateRange) => {
    const res = await getGoogleCalendarEvents(dateRange)
    if (Array.isArray(res)){
      const events = []
      res.forEach(it => {
        events.push({
          start: (!!it.start.dateTime ? it.start.dateTime : it.start.date),
          end: (!!it.end.dateTime ? it.end.dateTime : it.end.date),
          title: it.summary,
          type: 'google-calendar-event' + (it.organizer.displayName || ''),
          id: 'google-calendar-event' + it.id,
          allDay: !it.start.dateTime,
          meta: {
            type: !!it.start.dateTime ? 'timed-event' : 'all-day-event',
            htmlLink: it.htmlLink,
            creator: it.creator.email,
            organizer: it.organizer.displayName
          }
        })
      })
      dispatch({type: 'add', payload: events})
    }
  }
  
  const loadSessions = async (dateRange) => {
    const res = await getAllSessions(dateRange)
    const eventsFromSessions = []
    res.forEach(it=>{
      it.dates.forEach(date => {
        const start = new Date(date.start_time)
        const end = new Date(date.start_time)
        end.setMinutes(end.getMinutes() + 30)
        eventsFromSessions.push({
          id: `session-date-${date._id}`,
          start,
          end,
          title: `${it.studio.name} ${it.name} ${date.start_time_type} (${date.book_status})`,
          type: 'session',
          allDay: false,
          meta: {
            type: 'timed-event',
            studio: it.studio,
            lobbyManager: it.lobbyManager,
            manager: it.manager,
            startTimeType: date.start_time_type,
            bookStatus: date.book_status,
            htmlLink: `/studio/${it.studio.uri}/${it._id}`
          }
        })
      })
    })
    dispatch({
      type: 'add',
      payload: eventsFromSessions
    })
  }

  const loadAllEvents = async (dateRange) => {
    toggleLoadingState(true)
    await Promise.all([loadGoogleEvents(dateRange), loadSessions(dateRange)])
    toggleLoadingState(false)
  }

  const onDateRangeChange = (range) => {
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
    loadAllEvents(dateRange)
  }
  const eventStyleGetter = (event, start, end, isSelected) => {
    let bgColor = 'transparent'
    let textColor = '#000000'
    if (+new Date(start) > +new Date()) {
      bgColor = eventTypeColors[event.type]
      textColor = 'white'
      bgColor += 'DD'
    } else {
      textColor = eventTypeColors[event.type]
      bgColor = textColor + '22'
    }
    return {
      style: {
        backgroundColor: bgColor,
        color: textColor
      }
    }
  }

  const localizer = momentLocalizer(moment)

  const onSelectEvent = (e) => {
    setSelectedEvent(e)
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
    loadAllEvents(dateRange)
  }, [])

  if (!show) { return null }

  return (
    <div className="admin-events-calendar-container">
      <Calendar
        ref={calendarRef}
        popup
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onRangeChange={onDateRangeChange}
        onSelectEvent={onSelectEvent}
        eventPropGetter={eventStyleGetter}
      />
      <Modal
        show={!!selectedEvent}
        onHide={()=>{setSelectedEvent(null)}}
      >
        {!!selectedEvent && (
          <>
            <Modal.Header closeButton>
              <div>
              <h4 className="my-0">{selectedEvent.title}</h4>
              <p className="my-0">
                {(()=>{
                  if (selectedEvent.type === 'google-calendar-event') {
                    return 'Event from google calendar'
                  } else if (selectedEvent.type === 'session') {
                    return 'Event from session'
                  }
                })()}
              </p>
              </div>
            </Modal.Header>
            <Modal.Body>
              <Container
                className="text-10"
                fluid
              >
                <Row>
                  <Col>
                    <label className="font-weight-bold">From</label>
                    <p>{moment(selectedEvent.start).format('MM/DD/YYYY hh:mm A')}</p>
                  </Col>
                  <Col>
                    <label className="font-weight-bold">To</label>
                    <p>{moment(selectedEvent.end).format('MM/DD/YYYY hh:mm A')}</p>
                  </Col>
                </Row>
                {selectedEvent.type !== 'session' && (
                  <>
                    <p className="font-weight-bold">
                      {selectedEvent.meta.type === 'all-day-event' ? 'All Day Event' : 'Timed Event' }
                    </p>
                    <p>
                      Click&nbsp;
                      <a
                        className="break-word"
                        href={selectedEvent.meta.htmlLink}
                        target="_blank"
                      >
                        {selectedEvent.meta.htmlLink}
                      </a>
                      &nbsp;to see the event detail
                    </p>
                    <Row>
                      <Col>
                        <label className="font-weight-bold">Creator</label>
                        <p>{selectedEvent.meta.creator}</p>
                      </Col>
                      <Col>
                        <label className="font-weight-bold">Organizer</label>
                        <p>{selectedEvent.meta.organizer}</p>
                      </Col>
                    </Row>
                  </>
                )}
                {selectedEvent.type === 'session' && (
                  <>
                    <label className="font-weight-bold">Studio</label>
                    <p>{selectedEvent.meta.studio.name}</p>
                    <Row>
                      <Col>
                        <label className="font-weight-bold">Lobby Managers</label>
                        {selectedEvent.meta.lobbyManager && selectedEvent.meta.lobbyManager.length > 0
                          ? selectedEvent.meta.lobbyManager.map(it=>(
                            <p>{it.email}</p>
                          )) : (
                            <p>No entries found</p>
                          )
                        }
                      </Col>
                      <Col>
                        <label className="font-weight-bold">Managers</label>
                        {selectedEvent.meta.manager && selectedEvent.meta.manager.length > 0
                          ? selectedEvent.meta.manager.map(it=>(
                            <p>{it.email}</p>
                          )): (
                            <p>No entries found</p>
                          )
                        }
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <label className="font-weight-bold">Statt Time Type</label>
                        <p>{selectedEvent.meta.startTimeType}</p>
                      </Col>
                      <Col>
                        <label className="font-weight-bold">Book Status</label>
                        <p>{selectedEvent.meta.bookStatus}</p>
                      </Col>
                    </Row>
                    <p>
                      Click&nbsp;
                      <a
                        className="break-word"
                        href={selectedEvent.meta.htmlLink}
                        target="_blank"
                      >
                        here
                      </a>
                      &nbsp;to see the event detail
                    </p>
                  </>
                )}
              </Container>
            </Modal.Body>
            <Modal.Footer>
              <Button
                type="button"
                variant="primary"
                onClick={()=>{setSelectedEvent(null)}}
                className="px-4"
              >
                OK
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  )
}
export default CalendarTab