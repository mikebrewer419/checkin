import React from 'react'
import {
  Container,
  Row,
  Col
} from 'react-bootstrap'
export default () => {
  return (
    <div>
      <Container fluid>
        <Row>
          <Col>
            Project Description
          </Col>
        </Row>
        <Row>
          <Col>
            <div style={{background: 'gray', height: '200px'}}>
              message panel
            </div>
          </Col>
        </Row>
      </Container>  
    </div>
  )
}