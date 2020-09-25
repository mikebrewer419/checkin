import React from 'react'

const StudioForm = ({
  onSubmit,
  onCancel,
  _id,
  name = '',
  uri = '',
  jitsi_meeting_id = '',
  test_meeting_id = '',
  client_link = '',
  thankyou_message = '',
  position_messages = [],
  delete_message,
  logo = '',
  errors = {}
}) => {
  return (
    <form onSubmit={onSubmit} id="studio-form">
      <input type="hidden" name="_id" value={_id} />
      <div className="row">
        <div className="col">
          <div className="form-group">
            <label htmlFor="name">Project Name</label>
            <input required className="form-control form-control-sm"  type="text" name="name" id="name" defaultValue={name} />
          </div>
        </div>
        <div className="col">
          <div className="form-group">
            <label htmlFor="uri">Uri</label>
            <input required className="form-control form-control-sm"  type="text" name="uri" id="uri" defaultValue={uri} />
          </div>
        </div>
        <div className="col">
          <div className="form-group">
            <label htmlFor="jitsi_meeting_id">meeting_id</label>
            <input required id="jitsi_meeting_id" className="form-control form-control-sm"  type="text" name="jitsi_meeting_id" defaultValue={jitsi_meeting_id} />
          </div>
        </div>
        <div className="col">
          <div className="form-group">
            <label htmlFor="test_meeting_id">test_meeting_id</label>
            <input required id="test_meeting_id" className="form-control form-control-sm"  type="text" name="test_meeting_id" defaultValue={test_meeting_id} />
          </div>
        </div>
        <div className="col">
          <div className="form-group">
            <label htmlFor="client_link">client_link</label>
            <input id="client_link" className="form-control form-control-sm"  type="text" name="client_link" defaultValue={client_link} />
          </div>
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="thankyou_message">Thankyou_message</label>
        <input required className="form-control form-control-sm"  type="text" name="thankyou_message" id="thankyou_message"
          defaultValue={thankyou_message || `Thank you for checking in to PROJECT_NAME, to join the waiting room please enter 'TEST_MEETING_ID' into the app or click TEST_MEETING_ILINK`} />
      </div>
      <div className="form-group">
        <label htmlFor="position_messages1">Position_messages 1</label>
        <input required className="form-control form-control-sm"  type="text" name="position_messages[0]" id="position_messages1"
          defaultValue={position_messages[0] || ` It's now your turn to audition, please enter 'MEETING_ID' or click MEETING_LINK`} />
        <label htmlFor="position_messages2">Position_messages 2</label>
        <input required className="form-control form-control-sm"  type="text" name="position_messages[1]" id="position_messages2"
          defaultValue={position_messages[1] || `You are on deck! We'll text you shortly to join the casting.`} />
        <label htmlFor="position_messages3">Position_messages 3</label>
        <input className="form-control form-control-sm"  type="text" name="position_messages[2]" id="position_messages3"
          defaultValue={position_messages[2] || `Be ready. You're second in line.`} />
        <label htmlFor="position_messages4">Position_messages 4</label>
        <input className="form-control form-control-sm"  type="text" name="position_messages[3]" id="position_messages4"
          defaultValue={position_messages[3] || ``} />
      </div>
      <div className="form-group">
        <label htmlFor="delete_message">Delete message</label>
        <input className="form-control form-control-sm"  type="text" name="delete_message" id="delete_message"
          defaultValue={delete_message || `You arrived at the wrong time. Please come back at the correct call time and check in again.`} />
      </div>
      <div className="form-group">
        <label htmlFor="logo">Logo</label>
        <input className="form-control"  type="file" name="logo" id="logo" accept=".png, .jpg, .jpeg"/>
      </div>
      <div className="form-group">
        {errors.uri &&
          <p className="text-danger mb-1">Studio uri <strong>{errors.uri}</strong> already used!</p>}
        {errors.meeting_id &&
          <p className="text-danger mb-1">Meeting id <strong>{errors.meeting_id}</strong> already used!</p>
        }
      </div>
      <button type="submit" className="btn btn-primary">
        {_id? 'Update': 'Create'}
      </button>
      <label className="btn btn-secondary mb-0 ml-3" onClick={onCancel}>
        Cancel
      </label>
    </form>
  )
}

export default StudioForm
