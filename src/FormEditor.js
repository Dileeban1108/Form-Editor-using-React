import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useDropzone } from 'react-dropzone';
import { Button, Form as BootstrapForm, Container, Row, Col } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique IDs

const FormEditor = () => {
  const [welcomeText, setWelcomeText] = useState('Welcome to My Form!');
  const [theme, setTheme] = useState('light');
  const [fields, setFields] = useState([
    { id: '1', type: 'email', label: 'Email', name: 'email', validation: Yup.string().email('Invalid email').required('Email is required') },
  ]);
  const [files, setFiles] = useState([]);

  const availableFields = [
    { type: 'text', label: 'Text', name: 'text', validation: Yup.string().required('Text is required') },
    { type: 'number', label: 'Number', name: 'number', validation: Yup.number().required('Number is required') },
    { type: 'password', label: 'Password', name: 'password', validation: Yup.string().min(6, 'Too short').required('Password is required') },
  ];

  // Drag-and-drop handler for form fields
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const newFields = Array.from(fields);
    const [removed] = newFields.splice(result.source.index, 1);
    newFields.splice(result.destination.index, 0, removed);
    setFields(newFields);
  };

  const addField = (field) => {
    setFields([...fields, { ...field, id: uuidv4() }]); // Use uuid for unique IDs
  };

  const removeField = (id) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const validationSchema = Yup.object(
    fields.reduce((acc, field) => {
      acc[field.name] = field.validation;
      return acc;
    }, {})
  );

  const handleSubmit = (values, { setSubmitting }) => {
    setTimeout(() => {
      console.log('Form data:', values);
      setSubmitting(false);
    }, 400);
  };

  // Drag-and-drop file uploader
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles(prevFiles => [
        ...prevFiles,
        ...acceptedFiles.map(file => ({
          id: uuidv4(), // Generate a unique ID for each file
          file,
          preview: URL.createObjectURL(file)
        }))
      ]);
    }
  });

  return (
    <Container className={`form-editor-container ${theme}`} fluid>
      {/* Welcome Screen */}
      <Row className="mb-4">
        <Col className="text-center">
          <h1 className="mb-4" style={{ fontWeight: 'bold', color: '#007bff' }}>{welcomeText}</h1>
          <BootstrapForm.Group className="mb-3">
            <BootstrapForm.Label style={{ fontWeight: 'bold', color: '#007bff' }}>Customize Welcome Text:</BootstrapForm.Label>
            <BootstrapForm.Control 
              type="text" 
              value={welcomeText} 
              onChange={(e) => setWelcomeText(e.target.value)} 
            />
          </BootstrapForm.Group>
          <BootstrapForm.Group className="mb-3">
            <BootstrapForm.Label style={{ fontWeight: 'bold', color: '#007bff' }}>Select Theme:</BootstrapForm.Label>
            <BootstrapForm.Control 
              as="select" 
              value={theme} 
              onChange={(e) => setTheme(e.target.value)}
              style={{ backgroundColor: '#007bff', color: '#ffffff' }}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </BootstrapForm.Control>
          </BootstrapForm.Group>
        </Col>
      </Row>

      {/* Field Adder */}
      <Row className="mb-4 text-center">
        <Col>
          <h3 style={{ fontWeight: 'bold', color: '#007bff' }}>Add New Field</h3>
          {availableFields.map((field, index) => (
            <Button 
              key={index} 
              variant="success" 
              className="mx-2 mb-2" // Added margin-bottom for spacing
              onClick={() => addField(field)}
            >
              Add {field.label} Field
            </Button>
          ))}
        </Col>
      </Row>

      {/* Drag-and-Drop File Uploader */}
      <Row className="mb-4">
        <Col>
          <div 
            className="dropzone p-3 border border-dashed rounded"
            {...getRootProps()}
            style={{ textAlign: 'center', cursor: 'pointer' }}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the files here...</p>
            ) : (
              <p>Drag 'n' drop some files here, or click to select files</p>
            )}
          </div>
        </Col>
      </Row>

      {/* File Previews */}
      <Row className="mb-4">
        <Col>
          <div className="preview d-flex flex-wrap">
            {files.map((file) => (
              <div 
                key={file.id} 
                className="file-preview d-flex align-items-center justify-content-center position-relative mb-2"
                style={{ maxWidth: '200px', maxHeight: '200px' }} // Limit preview size
              >
                {file.file.type.startsWith('image/') ? (
                  <img src={file.preview} alt={file.file.name} className="img-fluid" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                ) : (
                  <p className="mb-0">{file.file.name}</p>
                )}
                <Button 
                  variant="danger" 
                  className="position-relative top-0 end-0 ms-2" 
                  onClick={() => setFiles(files.filter(f => f.id !== file.id))}
                >
                  X
                </Button>
              </div>
            ))}
          </div>
        </Col>
      </Row>

      {/* Dynamic Form with Drag-and-Drop */}
      <Formik 
        initialValues={fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {})} 
        validationSchema={validationSchema} 
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="dynamic-form p-3 border border-secondary rounded">
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="form-fields">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {fields.map((field, index) => (
                      <Draggable key={field.id} draggableId={field.id} index={index}>
                        {(provided) => (
                          <div
                            className="form-field d-flex flex-column flex-sm-row align-items-center p-3 border rounded mb-2 position-relative"
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}
                          >
                            <label htmlFor={field.name} className="me-2">{field.label}:</label>
                            <Field type={field.type} name={field.name} className="form-control flex-grow-1 mb-2 mb-sm-0 fs-3" />
                            <ErrorMessage name={field.name} component="div" className="text-danger" />
                            <Button 
                              variant="danger" 
                              type="button" 
                              className="position-relative top-0 end-0 ms-2 fs-6" 
                              onClick={() => removeField(field.id)}
                            >
                              X
                            </Button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <div className="d-flex justify-content-end mt-3">
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                Submit
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default FormEditor;
