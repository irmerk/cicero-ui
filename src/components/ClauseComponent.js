/* React */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Segment } from 'semantic-ui-react';

/* Styling */
import * as S from './styles';

/* Icons */
import * as deleteIcon from '../icons/trash';
import calculateButtonPopupPosition from '../icons/VariableListButton';

/* Actions */
import { titleGenerator, headerGenerator } from './actions';

const deleteIconProps = {
  'aria-label': deleteIcon.type,
  width: '15px',
  height: '19px',
  viewBox: '0 0 12 15'
};

/**
 * Component to render a clause
 * This will have an id property of the clauseid
 * @param {*} props
 */
function ClauseComponent(props) {
  const clauseProps = props.clauseProps || Object.create(null);
  const [hovering, setHovering] = useState(false);
  const [hoveringHeader, setHoveringHeader] = useState(false);

  const errorsComponent = props.errors
    ? <Segment contentEditable={false} attached raised>{props.errors}</Segment>
    : null;

  const title = titleGenerator(props.templateUri);
  const header = headerGenerator(props.templateUri, clauseProps.HEADER_TITLE);


  /**
     * Render form in popup to set the link.
     */
  const renderListButton = (props, editor) => {
    const { popupPosition, popupStyle } = calculateButtonPopupPosition(
      editor,
      hovering,
      // setLinkFormPopup
    );
    const { value } = editor;
    const { document, selection } = value;

    const hasLinks = (editor) => {
      const { value } = editor;
      return value.inlines.some(inline => inline.type === 'link');
    };

    const isLinkBool = hasLinks(editor);
    const selectedInlineHref = document.getClosestInline(selection.anchor.path);
    const selectedText = editor.value.document
      .getFragmentAtRange(editor.value.selection).text;

    return (
      <Ref innerRef={(node) => {
        setLinkFormPopup = node;
      }}>
      <Popup
        context={linkButtonRef}
        content={
          <Ref innerRef={(node) => {
            setLinkForm = node;
          }}>
            <Form
            onSubmit={event => submitLinkForm(event, isLinkBool) }>
              <Form.Field>
                <label>Link Text</label>
                <Input
                  placeholder='Text'
                  name='text'
                  defaultValue={
                    (isLinkBool && !selectedText)
                      ? editor.value.focusText.text
                      : editor.value.fragment.text
                  }
                />
              </Form.Field>
              <Form.Field>
                <label>Link URL</label>
                <Input
                  ref={hyperlinkInputRef}
                  placeholder={'http://example.com'}
                  defaultValue={
                    isLinkBool && action.isOnlyLink(editor) && selectedInlineHref
                      ? selectedInlineHref.data.get('href')
                      : ''
                  }
                  name='url'
                />
              </Form.Field>
              <Form.Field>
                <Button
                  secondary
                  floated='left'
                  disabled={!isLinkBool}
                  onMouseDown={removeLinkForm}>Remove</Button>
                <Button primary floated='right' type='submit'>Apply</Button>
              </Form.Field>
            </Form>
            </Ref>
          }
        onClose={closeSetLinkForm}
        on='click'
        open // Keep it open always. We toggle only visibility so we can calculate its rect
        position={popupPosition}
        style={popupStyle}
      />
      </Ref>
    );
  };

  return (
    <S.ClauseWrapper
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      id={props.clauseId}
    >
      <S.ClauseBackground
        clauseborder={clauseProps.CLAUSE_BORDER}
        clausebg={clauseProps.CLAUSE_BACKGROUND}
        contentEditable={false}
      />

      <S.ClauseHeader
        currentHover={hovering}
        headerfont={clauseProps.HEADER_FONT}
        headercolor={clauseProps.HEADER_COLOR}
        headerbg={clauseProps.CLAUSE_BACKGROUND}
        contentEditable={false}
      >
        {(hoveringHeader && header.length > 54)
          && <S.HeaderToolTipWrapper>
            <S.HeaderToolTip>
              {title + clauseProps.HEADER_TITLE}
            </S.HeaderToolTip>
          </S.HeaderToolTipWrapper>
        }
        <S.HeaderToolTipText
          onMouseEnter={() => setHoveringHeader(true)}
          onMouseLeave={() => setHoveringHeader(false)}
        >
          {header}
        </S.HeaderToolTipText>
      </S.ClauseHeader>
      <S.DeleteWrapper
        currentHover={hovering}
        deletebg={clauseProps.CLAUSE_BACKGROUND}
      >
      <S.ClauseDelete
        {...deleteIconProps}
        clausedelete={clauseProps.CLAUSE_DELETE}
        onClick={() => clauseProps.CLAUSE_DELETE_FUNCTION(props)}
      >
        {deleteIcon.icon()}
      </ S.ClauseDelete>
      </S.DeleteWrapper>
      <S.ClauseBody
        bodyfont={clauseProps.BODY_FONT}
        variablecolor={clauseProps.VARIABLE_COLOR}
        conditionalcolor={clauseProps.CONDITIONAL_COLOR}
        computedcolor={clauseProps.COMPUTED_COLOR}
      >
        {props.children}
            {renderListButton(props, props.editor)}
      </S.ClauseBody>
    {errorsComponent}
  </S.ClauseWrapper>
  );
}

ClauseComponent.propTypes = {
  children: PropTypes.arrayOf(PropTypes.object).isRequired,
  templateUri: PropTypes.string.isRequired,
  attributes: PropTypes.PropTypes.shape({
    'data-key': PropTypes.string,
  }),
  editor: PropTypes.any,
  errors: PropTypes.object,
  removeFromContract: PropTypes.func,
  clauseId: PropTypes.string,
  clauseProps: PropTypes.shape({
    BODY_FONT: PropTypes.string,
    CLAUSE_BACKGROUND: PropTypes.string,
    CLAUSE_BORDER: PropTypes.string,
    CLAUSE_DELETE: PropTypes.string,
    CLAUSE_DELETE_FUNCTION: PropTypes.func,
    COMPUTED_COLOR: PropTypes.string,
    HEADER_COLOR: PropTypes.string,
    HEADER_FONT: PropTypes.string,
    HEADER_TITLE: PropTypes.string,
    VARIABLE_COLOR: PropTypes.string,
    CONDITIONAL_COLOR: PropTypes.string,
  }),
};

export default ClauseComponent;
