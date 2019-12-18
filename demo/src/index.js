import React, {
  useCallback, useEffect, useState
} from 'react';
import {
  Button, Grid, Header, Segment
} from 'semantic-ui-react';

import { Clause, Template } from '@accordproject/cicero-core';
import { SlateTransformer } from '@accordproject/markdown-slate';

import { render } from 'react-dom';
import 'semantic-ui-css/semantic.min.css';
import ContractEditor from '../../src/ContractEditor';

const slateTransformer = new SlateTransformer();

/*

Discount means an amount that we charge you for accepting the Card, which amount is:
1. a percentage (Discount Rate) of the face amount of the Charge that you submit, or a flat per-
Transaction fee, or a combination of both; and/or
1. a Monthly Flat Fee (if you meet our requirements).

Transaction Processing and Payments. Our Card acceptance, processing, and payment requirements are set forth in the Merchant Regulations. Some requirements are summarized here for ease of reference, but do not supersede the provisions in the Merchant Regulations.
Payment for Charges. We will pay you, through our agent, according to your payment plan in US dollars for the face amount of Charges submitted from your Establishments less all applicable deductions, rejections, and withholdings, which include:
1. the Discount,
1. any amounts you owe us or our Affiliates,
1. any amounts for which we have Chargebacks and
1. any Credits you submit.

Your initial Discount is indicated in the Agreement or otherwise provided to you in writing by us. In addition to your Discount we may charge you additional fees and assessments, as listed in the Merchant Regulations or as otherwise provided to you in writing by us. We may adjust any of these amounts and may change any other amount we charge you for accepting the Card.

### SETTLEMENT

#### Settlement Amount.

Our agent will pay you according to your payment plan, as described below, in US dollars for the face amount of Charges submitted from your Establishments less all applicable deductions, rejections, and withholdings, which include:
1. the Discount,
1. any amounts you owe us or our Affiliates,
1. any amounts for which we have Chargebacks, and
1. any Credits you submit.
*/

const templateUri = 'https://templates.accordproject.org/archives/volumediscountulist@0.2.1.cta';
// const templateUri = 'ap://volumediscountulist@0.2.1#76a90a50ac8db3a4161d4d53003e67740126ec0593c34192665a6f575f9ee070';
const clauseText = `Volume-Based Card Acceptance Agreement [Abbreviated]
----

This Agreement is by and between Card, Inc., a New York corporation, and you, the Merchant. By accepting the Card, you agree to be bound by the Agreement.

Our agent will subtract the full amount of all applicable deductions, rejections, and withholdings, from this payment to you (or debit your Bank Account), but if it cannot, then you must pay it promptly upon demand.

#### Discount.

The Discount is determined according to the following table:

\`\`\` <list/>
- <variable id="volumeAbove" value="0.0"/>$ million <= Volume < <variable id="volumeUpTo" value="1.0"/>$ million : <variable id="rate" value="3.1"/>%
- <variable id="volumeAbove" value="1.0"/>$ million <= Volume < <variable id="volumeUpTo" value="10.0"/>$ million : <variable id="rate" value="3.1"/>%
- <variable id="volumeAbove" value="10.0"/>$ million <= Volume < <variable id="volumeUpTo" value="50.0"/>$ million : <variable id="rate" value="2.9"/>%
- <variable id="volumeAbove" value="50.0"/>$ million <= Volume < <variable id="volumeUpTo" value="500.0"/>$ million : <variable id="rate" value="2.5"/>%
- <variable id="volumeAbove" value="500.0"/>$ million <= Volume < <variable id="volumeUpTo" value="1000.0"/>$ million : <variable id="rate" value="1.2"/>%
- <variable id="volumeAbove" value="1000.0"/>$ million <= Volume < <variable id="volumeUpTo" value="1000000.0"/>$ million : <variable id="rate" value="0.1"/>%
\`\`\``;

// b0bb9fb2-3e90-4906-9f2b-da08517ad401
const getContractSlateVal = async () => {
  const acceptanceOfDeliveryClause = `\`\`\` <clause src="${templateUri}" clauseid="123">
${clauseText}
\`\`\`
`;

  const defaultContractMarkdown = `# Heading One
  This is text. This is *italic* text. This is **bold** text. This is a [link](https://clause.io). This is \`inline code\`.
  
  ${acceptanceOfDeliveryClause}
  
  Fin.
  `;
  return slateTransformer.fromMarkdown(defaultContractMarkdown);
};

/**
 * Parses user inputted text for a template using Cicero
 * @param {object} clauseNode The slate node of the clause.
 * @returns {Promise} The result of the parse or an error.
 */
const parseClause = (template, clauseNode) => {
  try {
    const ciceroClause = new Clause(template);
    const slateTransformer = new SlateTransformer();
    const value = {
      document: {
        nodes: clauseNode.nodes
      }
    };
    const text = slateTransformer.toMarkdown(value, { wrapVariables: false });
    ciceroClause.parse(text);
    const parseResult = ciceroClause.getData();
    console.log(parseResult);
  } catch (error) {
    console.log(error);
  }
};


/**
 * A demo component that uses ContractEditor
 */
function Demo() {
  /**
   * Currently contract value
   */
  const [contractValue, setContractValue] = useState(null);
  const [lockTextState, setlockTextState] = useState(true);
  const [templateObj, setTemplateObj] = useState({});

  /**
   * Async rewrite of the markdown text to a slate value
   */
  useEffect(() => {
    getContractSlateVal().then(value => setContractValue(value));
  }, []);

  const fetchTemplateObj = async (uri) => {
    try {
      const template = await Template.fromUrl(uri);
      setTemplateObj({ ...templateObj, [uri]: template });
    } catch (err) {
      console.log(err);
    }
  };


  /**
   * Called when the data in the contract editor has been modified
   */
  const onContractChange = useCallback((value) => {
    setContractValue(value);
  }, []);

  const editorProps = {
    BUTTON_BACKGROUND_INACTIVE: null,
    BUTTON_BACKGROUND_ACTIVE: null,
    BUTTON_SYMBOL_INACTIVE: null,
    BUTTON_SYMBOL_ACTIVE: null,
    DROPDOWN_COLOR: null,
    TOOLBAR_BACKGROUND: null,
    TOOLTIP_BACKGROUND: null,
    TOOLTIP: null,
    TOOLBAR_SHADOW: null,
    WIDTH: '600px',
  };

  const demo = <ContractEditor
        lockText={lockTextState}
        value={contractValue}
        onChange={onContractChange}
        editorProps={editorProps}
        onClauseUpdated={(clauseNode => parseClause(templateObj[clauseNode.data.get('src')], clauseNode))}
        loadTemplateObject={fetchTemplateObj}
      />;

  return (
    <div>
      <Button onClick={() => setlockTextState(!lockTextState)} >Toggle lockText</Button>
      <Header size='medium'>lockText state: {lockTextState.toString()}</Header>
      <Grid centered columns={2}>
        <Grid.Column>
          <Segment>
          {demo}
          </Segment>
        </Grid.Column>
      </Grid>
    </div>
  );
}

render(<Demo/>, document.querySelector('#root'));
