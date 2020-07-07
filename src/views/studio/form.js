import React, { useState } from 'react'

const StudioForm = ({
  onSubmit,
  onCancel,
  _id,
  name = '',
  uri = '',
  twilio_account_sid = '',
  twilio_auth_token = '',
  twilio_from_number = '',
  jitsi_meeting_ids = [],
  comet_chat_appid = '',
  comet_chat_auth = '',
  comet_api_key = '',
  thankyou_message = '',
  position_messages = [],
  logo = '',
}) => {
  const [meeting_ids, setMeetingIds] = useState(jitsi_meeting_ids)
  return (
    <form onSubmit={onSubmit} id="studio-form">
      <h4>{_id? `Update ${name}`: 'Create New Studio'}</h4>
      <input type="hidden" name="_id" value={_id} />
      <div className="row">
        <div className="col-4">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input required className="form-control form-control-sm"  type="text" name="name" id="name" defaultValue={name} />
          </div>
          <div className="form-group">
            <label htmlFor="uri">Uri</label>
            <input required className="form-control form-control-sm"  type="text" name="uri" id="uri" defaultValue={uri} />
          </div>
          <div className="form-group">
            <label htmlFor="jitsi_meeting_ids">Jitsi_meeting_ids</label>
            {meeting_ids.map((meeting_id, idx) => (
              <input key={idx} required className="form-control form-control-sm"  type="text" name={`jitsi_meeting_ids[${idx}]`} defaultValue={meeting_id} />
            ))}
            <input
              key={meeting_ids.length}
              className="form-control form-control-sm"
              type="text"
              name={`jitsi_meeting_ids[${meeting_ids.length}]`}
              id="jitsi_meeting_ids"
              defaultValue={''}
              onBlur={ev => ev.target.value && setMeetingIds(meeting_ids.concat(ev.target.value))}
            />
          </div>
        </div>
        <div className="col-4">
          <div className="form-group">
            <label htmlFor="twilio_account_sid">Twilio_account_sid</label>
            <input required className="form-control form-control-sm"  type="text" name="twilio_account_sid" id="twilio_account_sid" defaultValue={twilio_account_sid} />
          </div>
          <div className="form-group">
            <label htmlFor="twilio_auth_token">Twilio_auth_token</label>
            <input required className="form-control form-control-sm"  type="text" name="twilio_auth_token" id="twilio_auth_token" defaultValue={twilio_auth_token} />
          </div>
          <div className="form-group">
            <label htmlFor="twilio_from_number">Twilio_from_number</label>
            <input required className="form-control form-control-sm"  type="text" name="twilio_from_number" id="twilio_from_number" defaultValue={twilio_from_number} />
          </div>
        </div>
        <div className="col-4">
          <div className="form-group">
            <label htmlFor="comet_chat_appid">Comet_chat_appid</label>
            <input required className="form-control form-control-sm"  type="text" name="comet_chat_appid" id="comet_chat_appid"
              defaultValue={comet_chat_appid || `54561`} />
          </div>
          <div className="form-group">
            <label htmlFor="comet_chat_auth">Comet_chat_auth</label>
            <input required className="form-control form-control-sm"  type="text" name="comet_chat_auth" id="comet_chat_auth"
              defaultValue={comet_chat_auth || `850e238c248ea33bccd59722a16d3823`} />
          </div>
          <div className="form-group">
            <label htmlFor="comet_api_key">Comet_api_key</label>
            <input required className="form-control form-control-sm"  type="text" name="comet_api_key" id="comet_api_key"
              defaultValue={comet_api_key || `54561x492113bb62aa70fc91b6d3136965bfb5`} />
          </div>
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="thankyou_message">Thankyou_message</label>
        <input required className="form-control form-control-sm"  type="text" name="thankyou_message" id="thankyou_message"
          defaultValue={thankyou_message || `Thank you for checking in to STUDIO_NAME, we will text you shortly with instructions. Reply with word 'p' to check your place in line now`} />
      </div>
      <div className="form-group">
        <label htmlFor="position_messages1">Position_messages 1</label>
        <input required className="form-control form-control-sm"  type="text" name="position_messages[0]" id="position_messages1"
          defaultValue={position_messages[0] || `It's now your turn to audition, please enter 'STUDIO_NAME' into the app and click 'create/join`} />
        <label htmlFor="position_messages2">Position_messages 2</label>
        <input required className="form-control form-control-sm"  type="text" name="position_messages[1]" id="position_messages2"
          defaultValue={position_messages[1] || `You are on deck! We'll text you shortly to join the casting.`} />
        <label htmlFor="position_messages3">Position_messages 3</label>
        <input className="form-control form-control-sm"  type="text" name="position_messages[2]" id="position_messages3"
          defaultValue={position_messages[2] || `Please head to Southpaw Studios and wait on the patio. You are 2nd in line`} />
        <label htmlFor="position_messages4">Position_messages 4</label>
        <input className="form-control form-control-sm"  type="text" name="position_messages[3]" id="position_messages4"
          defaultValue={position_messages[3] || `Be prepared, you are next in line to head to Southpaw Studios. We will contact you shortly`} />
      </div>
      <div className="form-group">
        <label htmlFor="logo">Logo</label>
        <input className="form-control"  type="file" name="logo" id="logo"/>
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