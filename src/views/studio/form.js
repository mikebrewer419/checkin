import React, { useState } from 'react'
import clsx from 'classnames'
import { PROJECT_TYPES } from '../../constants'

const StudioForm = ({
  onSubmit,
  onCancel,
  _id,
  name = '',
  uri = '',
  jitsi_meeting_id = '',
  test_meeting_id = '',
  thankyou_message = '',
  position_back_message = '',
  position_messages = [],
  audition_purchase_message = '',
  good_bye_message = '',
  delete_message,
  project_type = PROJECT_TYPES.DEFAULT,
  logo = '',
  errors = {}
}) => {
  const [showAuditionPurchaseMsg, setShowAuditionPurchaseMsg] = useState(project_type === PROJECT_TYPES.CREATOR)

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
      </div>
      <div className="form-group">
        <label htmlFor="thankyou_message">Thankyou_message</label>
        <input required className="form-control form-control-sm"  type="text" name="thankyou_message" id="thankyou_message"
          defaultValue={thankyou_message || `Thank you for checking in to PROJECT_NAME. To join virtual lobby click the button below or enter 'TEST_MEETING_ID' into the app. You can always return to this page on any device with this link: TALENT_STATUS_LINK`} />
      </div>
      <div className="form-group">
        <label htmlFor="position_messages1">Position back message</label>
        <input className="form-control form-control-sm" type="text" name="position_back_message" id="position_back_message"
          defaultValue={position_back_message || `Please return to virtual lobby. Enter 'TEST_MEETING_ID' or click TALENT_STATUS_LINK`} />
        <label htmlFor="position_messages1">Position_messages 1</label>
        <input required className="form-control form-control-sm"  type="text" name="position_messages[0]" id="position_messages1"
          defaultValue={position_messages[0] || `It's now your turn to audition, on desktop click the "Join Casting" button. On mobile, click TALENT_STATUS_LINK or enter MEETING_ID. ***IMPORTANT: Click Ask to Join`} />
        <label htmlFor="position_messages2">Position_messages 2</label>
        <input required className="form-control form-control-sm"  type="text" name="position_messages[1]" id="position_messages2"
          defaultValue={position_messages[1] || `You are on deck! We'll text you shortly to join the casting.`} />
        <label htmlFor="position_messages3">Position_messages 3</label>
        <input className="form-control form-control-sm"  type="text" name="position_messages[2]" id="position_messages3"
          defaultValue={position_messages[2] || ``} />
        <label htmlFor="position_messages4">Position_messages 4</label>
        <input className="form-control form-control-sm"  type="text" name="position_messages[3]" id="position_messages4"
          defaultValue={position_messages[3] || ``} />
        <label htmlFor="position_messages4">Good bye message</label>
        <input className='form-control form-control-sm' type="text" name="good_bye_message" id="good_bye_message"
          defaultValue={good_bye_message || 'Thank you for using Hey Joe! Want to step up your at-home video setup? Use offer code crush20 for $20 off our Mini Workshop heyjoe.io/workshop Valid til 2/1/21'} />
      </div>
      <div className="form-group">
        <label htmlFor="delete_message">Delete message</label>
        <input className="form-control form-control-sm"  type="text" name="delete_message" id="delete_message"
          defaultValue={delete_message || `You arrived at the wrong time. Please come back at the correct call time and check in again.`} />
      </div>
      <div className={clsx("form-group mt-4", {
        'mb-0': showAuditionPurchaseMsg
      })}>
        <input className="mr-1 mt-1"  type="checkbox" name="creator" id="creator" defaultChecked={project_type === PROJECT_TYPES.CREATOR} onChange={(ev) => {
          setShowAuditionPurchaseMsg(ev.target.checked)
        }} />
        <label htmlFor="creator">Creator project</label>
      </div>
      {showAuditionPurchaseMsg && (
        <div className="form-group">
          <label htmlFor="audition_purchase_message">Audition Purchase Message</label>
          <input className="form-control form-control-sm"  type="text" name="audition_purchase_message" id="audition_purchase_message"
            defaultValue={audition_purchase_message || `Thank you for auditioning for PROJECT_NAME. Get a link to your audition footage to save and share : LINK_TO_PURCHASE_INVOICE`} />
        </div>
      )}

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
