import React, {
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react'
import {Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
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
      return [...state, ...newEvents];
  }
}

const CalendarTab = () => {
  const [events, dispatch] = useReducer(reducer, initialState)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const toggleLoadingState = useContext(ShowLoadingContext)
  
  const loadEvents = async (dateRange) => {
    const res = await getGoogleCalendarEvents(dateRange)
    if (Array.isArray(res)){
      const events = []
      res.forEach(it => {
        events.push({
          start: new Date(!!it.start.dateTime ? it.start.dateTime : it.start.date),
          end: new Date(!!it.end.dateTime ? it.end.dateTime : it.end.date),
          title: it.summary,
          type: 'google-calendar-event',
          id: 'google-calendar-event' + it.id,
          meta: {
            type: !!it.start.dateTime ? 'timed-event' : 'all-day-event',
            htmlLink: it.htmlLink,
            creator: it.creator.email,
            organizer: it.organizer.email
          }
        })
        
      })
      dispatch({type: 'add', payload: events})
    }
  }
  const loadSessions = async () => {
    const res = await getAllSessions()
    console.log(res)
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
          title: `${it.studio.name} ${it.name} session ${!!it.start_time ? it.start_time : ''}`,
          type: 'session',
          meta: {
            studio: it.studio,
            lobbyManager: it.lobbyManager,
            manager: it.manager,
            startTimeType: date.start_time_type,
            bookStatus: date.book_status
          }
        })
      })
    })
    dispatch({
      type: 'add',
      payload: eventsFromSessions
    })
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
    toggleLoadingState(true)
    loadEvents(dateRange).then((res) => {
      toggleLoadingState(false)
    })
    toggleLoadingState(true)
    loadSessions().then(res=>{
      toggleLoadingState(false)  
    })
    
  }, [])
  
  return (
    <div className="admin-events-calendar-container">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onRangeChange={onDateRangeChange}
        onSelectEvent={onSelectEvent}
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
                    <p className="text-muted">{selectedEvent.start.toLocaleString()}</p>
                  </Col>
                  <Col>
                    <label className="font-weight-bold">To</label>
                    <p className="text-muted">{selectedEvent.end.toLocaleString()}</p>
                  </Col>
                </Row>
                {selectedEvent.type === 'google-calendar-event' && (
                  <>
                    <p className="font-weight-bold">
                      {selectedEvent.meta.type === 'all-day-event' ? 'All Day Event' : 'Timed Event' }
                    </p>
                    <p className="text-muted">
                      Click&nbsp;
                      <a
                        className="break-word"
                        href={selectedEvent.meta.htmlLink}
                      >
                        {selectedEvent.meta.htmlLink}
                      </a>
                      &nbsp;to see the event detail
                    </p>
                    <Row>
                      <Col>
                        <label className="font-weight-bold">Creator</label>
                        <p className="text-muted">{selectedEvent.meta.creator}</p>
                      </Col>
                      <Col>
                        <label className="font-weight-bold">Organizer</label>
                        <p className="text-muted">{selectedEvent.meta.organizer}</p>
                      </Col>
                    </Row>
                  </>
                )}
                {selectedEvent.type === 'session' && (
                  <>
                    <label className="font-weight-bold">Studio</label>
                    <p className="text-muted">{selectedEvent.meta.studio.name}</p>
                    <Row>
                      <Col>
                        <label className="font-weight-bold">Lobby Managers</label>
                        {selectedEvent.meta.lobbyManager && selectedEvent.meta.lobbyManager.length > 0
                          ? selectedEvent.meta.lobbyManager.map(it=>(
                            <p className="text-muted">{it.email}</p>
                          )) : (
                            <p className="text-muted">No entries found</p>
                          )
                        }
                      </Col>
                      <Col>
                        <label className="font-weight-bold">Managers</label>
                        {selectedEvent.meta.manager && selectedEvent.meta.manager.length > 0
                          ? selectedEvent.meta.manager.map(it=>(
                            <p className="text-muted">{it.email}</p>
                          )): (
                            <p className="text-muted">No entries found</p>
                          )
                        }
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <label className="font-weight-bold">Statt Time Type</label>
                        <p className="text-muted">{selectedEvent.meta.startTimeType}</p>
                      </Col>
                      <Col>
                        <label className="font-weight-bold">Book Status</label>
                        <p className="text-muted">{selectedEvent.meta.bookStatus}</p>
                      </Col>
                    </Row>
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