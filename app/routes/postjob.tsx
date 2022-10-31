import { Form, Link, useTransition } from '@remix-run/react';
import React, { useEffect, useState } from 'react';
import { Input } from '~/components/Form/Input';
import { Select } from '~/components/Form/Select';
import { TextArea } from '~/components/Form/TextArea';
import { Label } from '~/components/Form/Label';
import { CheckBoxList } from '~/components/Form/CheckBoxList';

import { MenuBar } from '~/components/Tiptap Editor/menubar';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import sanitizeHtml from 'sanitize-html';

import { FindTextColor } from '~/helpers/findTextColor';
import { stateList } from '~/helpers/stateList';
import { SalaryHelper } from '~/helpers/salaryHelper';
import { employmentList } from '~/helpers/employmentList';

import payForm from '../styles/payForm.css';
import blocks from '../styles/blocks.css';
import { commitSession, getSession } from '~/sessions.server';
import type { LoaderFunction } from '@remix-run/node';
import {
  json,
  redirect,
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from '@remix-run/node';
import { createCheckoutSession } from '~/models/pay.server';

import toast, { Toaster } from 'react-hot-toast';

export const links = () => [
  { rel: 'stylesheet', href: payForm },
  { rel: 'stylesheet', href: blocks },
];

async function convertToBuffer(a: AsyncIterable<Uint8Array>) {
  const result = [];
  for await (const chunk of a) {
    result.push(chunk);
  }
  return Buffer.concat(result);
}

export const action = async ({ request }: { request: Request }) => {
  console.log('in pay action creating first session from form data');

  const session = await getSession(request.headers.get('Cookie'));

  const uploadHandler = unstable_composeUploadHandlers(
    // our custom upload handler
    async ({ name, contentType, data, filename }) => {
      if (name !== 'logo') {
        return undefined;
      }
      const imageBuffer = await convertToBuffer(data);
      const uploadedImage = await imageFormatTest(imageBuffer, contentType);
      return uploadedImage.join(',');
    },
    // fallback to memory for everything else
    unstable_createMemoryUploadHandler()
  );

  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const amount = formData.get('amount') as string;
  session.set('amount', amount);
  const receipt_email = formData.get('receipt_email') as string;
  session.set('receipt_email', receipt_email);

  session.set('image', formData.get('logo'));
  session.set('position', formData.get('position'));
  session.set('company', formData.get('company'));
  session.set('city', formData.get('city'));
  session.set('state', formData.get('state'));
  session.set('employment', formData.get('employment'));
  session.set('minSalary', formData.get('minSalary'));
  session.set('maxSalary', formData.get('maxSalary'));
  session.set('benefits', formData.get('benefits'));
  session.set('description', formData.get('description'));
  session.set('url', formData.get('url'));
  session.set('color', formData.get('color'));

  await commitSession(session);

  const url = await createCheckoutSession(Number(amount), receipt_email);
  return redirect(url);
};

export const loader: LoaderFunction = async ({
  request,
}: {
  request: Request;
}) => {
  // Get the session from the cookie
  const session = await getSession(request.headers.get('Cookie'));
  const myStoredData = session.get('myStoredData');
  console.log('check if session saved #1:', myStoredData);
  // If no session found (was never created or was expired) create a new session.
  if (!myStoredData) {
    session.set('myStoredData', 'Some data');
    const myStoredDataif = session.get('myStoredData');
    console.log('checking if session saved #2:', myStoredDataif);
    console.log('CREATED NEW SESSION!');
    return json(
      {
        message: 'Created new session',
      },
      {
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      }
    );
  }
  // If session was found, present the session info.
  return json({
    message: `Showing Session info: ${myStoredData}`,
  });
};

export default function PayForm() {
  const editor = useEditor({
    extensions: [StarterKit],
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none',
      },
    },
    content: `
    <p><strong>Write your job description here</strong> </p>
    <p>Check out the preview by scrolling to the bottom of the form</p>
    <p>Use the menu bar to apply styles!</p>
    `,
  });

  // ! SET ONE USESTATE FOR ALL FIELDS OF THE FORM. USE THE SPREAD OPERATOR ... to change where needed for
  // ! specific field changes
  const [image, setImage] = useState(undefined);
  const onImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setImage(URL.createObjectURL(event.target.files[0]));
    }
  };
  //
  const [color, setColor] = useState('#FFFFFF');
  const onColorChange = (event) => {
    setColor(event.target.value);
  };
  const [company, setCompany] = useState('');
  const onCompanyChange = (event) => {
    setCompany(event.target.value);
  };
  const [job, setJob] = useState('');
  const onJobChange = (event) => {
    setJob(event.target.value);
  };
  const [minsalary, setMinSalary] = useState('');
  const onMinSalaryChange = (event) => {
    setMinSalary(event.target.value);
  };
  const [maxsalary, setMaxSalary] = useState('');
  const onMaxSalaryChange = (event) => {
    setMaxSalary(event.target.value);
  };
  const [state, setState] = useState('');
  const onStateChange = (event) => {
    setState(event.target.value);
  };
  const [employment, setEmployment] = useState('');
  const onEmploymentChange = (event) => {
    setEmployment(event.target.value);
  };

  const [benefits, setBenefits] = useState<{ selections: string[] }>({
    selections: [],
  });
  const options = [
    ['Medical', '🏥'],
    ['Dental', '🦷'],
    ['Vision', '👓'],
    ['401k', '💰'],
  ];

  //https://github.com/petrosDemetrakopoulos/react-multiple-checkboxes/blob/main/src/App.tsx
  function handleCheckboxChange(key: string) {
    let sel = benefits.selections;
    let find = sel.indexOf(key);
    if (find > -1) {
      sel.splice(find, 1);
    } else {
      sel.push(key);
    }

    setBenefits({
      selections: sel,
    });
  }

  let transition = useTransition();
  let busy = transition.state === 'submitting';

  useEffect(() => {
    if (transition.state === 'submitting') {
      toast.loading('Submitting...');
    }
    // ! Include something for error?
  }, [transition.state]);

  const numCostMonth = 50;
  const displayNumCostMonth = 50 / 100;
  const costForMonth = numCostMonth.toString();

  // ! Try to change this later on so default value checked in inputs is value shown in pay button
  // ! To be used later when have more payment options
  // const [postCost, setPostCost] = useState(costForWeek);
  // const onPostCostChange = (event) => {
  //   setPostCost(event.target.value);
  // };

  const Salaries = SalaryHelper();

  const lightColor = '#FFFFFF';
  const darkColor = '#000000';

  const textColor = FindTextColor(color, lightColor, darkColor);

  let editorValue = editor?.getHTML();
  if (!editorValue) editorValue = '';
  editorValue = sanitizeHtml(editorValue);

  return (
    <>
      <nav>
        <div className="pl-6 pt-4 w-28 sm:pl-2 sm:w-20">
          <Link
            to="/"
            className="font-Atkinson blocks border-[3px] border-black sm:text-sm text-xl"
            style={{ background: `#00ae86`, color: `white` }}
          >
            Home
          </Link>
        </div>
      </nav>
      <main className="relative">
        <Toaster
          toastOptions={{
            style: {
              padding: '1.8rem',
              background: '#00ae86',
              color: 'white',
            },
          }}
          containerStyle={{
            top: 20,
          }}
        />
        <Form
          replace
          method="post"
          // action="/pay"
          className="p-8 sm:p-2 relative"
          // onBlur={(e) => fetcher.submit(e.currentTarget)}
          encType="multipart/form-data"
        >
          <div className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 rounded p-4 mt-2 mb-6 border-2 border-black shadow-sm">
            {/* <div className="bg-white"> */}
            <h1 className="text-sm font-black uppercase mb-4 -mt-8 flex justify-center md:text-xs">
              <span className="border-2 border-black p-1 rounded-lg bg-yellow-400">
                Job Information
              </span>
            </h1>
            {/* </div> */}
            <Label name="company" label="Company 🏢 *️" />
            <Input
              name="company"
              type="text"
              required={true}
              onChange={onCompanyChange}
            />
            <p className="font-Atkinson text-black text-xs mt-2 sm:text-[10px] px-2">
              Your company's brand/trade name: without Inc., Ltd., B.V., Pte.,
              etc.
            </p>

            <div className="flex flex-row items-center">
              <div className="w-32">
                <Label name="logo" label="Logo 🖼️ *" />
                <Input
                  type="file"
                  name="logo"
                  accept="image/png, image/jpeg, image/avif, image/webp"
                  onChange={onImageChange}
                  required={true}
                />
              </div>

              <div>
                {image ? (
                  <img
                    src={image}
                    className="object-scale-down h-18 rounded-md shadow-xl text-xs appearance-none"
                    alt="Company Logo"
                    width="53"
                    height="53"
                  />
                ) : undefined}
              </div>
            </div>

            <Label name="position" label="Position 🧑 *️" />
            <Input
              type="text"
              name="position"
              required={true}
              onChange={onJobChange}
            />
            <p className="font-Atkinson text-black text-xs mt-2 sm:text-[10px] px-2">
              Please specify as single job position like "Marketing Manager" or
              "Clinical Assistant", not a sentence like "Looking for PM / Biz
              Dev / Manager". PLEASE DO NOT WRITE IN FULL CAPS. Job post is
              limited to a single job.
            </p>

            <Label name="city" label="City 🌆" />
            <Input type="text" name="city" />

            <Label name="state" label="State 🗺️ *️" />
            <Select
              name="state"
              optionList={stateList}
              required={true}
              onChange={onStateChange}
            />

            <Label name="state" label="Employment Type 🕑 *️" />
            <Select
              name="employment"
              optionList={employmentList}
              required={true}
              onChange={onEmploymentChange}
            />

            <p className="font-Atkinson mt-4 my-2 pl-2 font-black text-black-400 text-xl sm:text-sm">
              Annual Salary Or Compensation In Usd (Gross, Annualized,
              Full-time-equivalent (FTE) In USD Equivalent) 💸 *
            </p>
            <div className="flex items-center mb-4">
              <Select
                name="minSalary"
                optionList={Salaries.minArr}
                required={true}
                onChange={onMinSalaryChange}
              />
              <p>↔️</p>
              <Select
                name="maxSalary"
                optionList={Salaries.maxArr}
                required={true}
                onChange={onMaxSalaryChange}
              />
            </div>

            <div className="mb-6">
              <Label name="Benefits" label="Benefits ➕" />
              {options.map((option) => (
                <CheckBoxList
                  key={option[0]}
                  name={option[0]}
                  text={option[0] + ' ' + option[1]}
                  handleOnChange={() => handleCheckboxChange(option[0])}
                  selected={benefits.selections.includes(option[0])}
                />
              ))}
              <input
                type="hidden"
                name="benefits"
                value={benefits.selections.toString()}
              />
            </div>

            <MenuBar editor={editor} />
            <div className="overflow-auto sm:h-80 h-[42rem] bg-white rounded-md border-2 border-gray-400">
              <EditorContent editor={editor} className="outline-none" />
            </div>
            <br />

            <Input type="hidden" name="description" value={editorValue}></Input>

            <Label name="url" label="Apply Url 🔗" />
            <Input
              type="text"
              name="url"
              placeholder="https://"
              required={true}
            />
            <p className="font-Atkinson text-black text-xs mt-2 sm:text-[10px] px-2">
              Apply URL with a form an applicant can fill out.
            </p>
            <Label name="receipt_email" label="Email 📧" />
            <Input type="email" name="receipt_email" required={true} />
            <p className="font-Atkinson text-black text-xs mt-2 sm:text-[10px] px-2">
              An invoice will be sent to this email
            </p>
          </div>

          <div className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 rounded p-4 mt-2 mb-6 border-2 border-black shadow-sm">
            <h1 className="text-sm font-black uppercase mb-4 -mt-8 flex justify-center md:text-xs">
              <span className="border-2 border-black p-1 rounded-lg bg-yellow-400">
                Posting Details
              </span>
            </h1>
            <div className="flex flex-col">
              <Label name="color" label="Pick background color 🎨" />
              <div className="flex items-center">
                <p>➡️ &nbsp;</p>
                <Input
                  type="color"
                  name="colorpicker"
                  value="#ffffff"
                  onChange={onColorChange}
                />
                <p>&nbsp; ⬅️</p>
                <input type="hidden" name="color" value={color} />
              </div>
            </div>

            <div className="my-6">
              <Label name="Post Length" label="Post Length ⏰" />
              <p className="font-Atkinson text-black text-base mt-2 sm:text-[14px] px-2">
                <u>
                  The job post will be pinned to the top of the job feed for{' '}
                  <strong>1 month</strong>
                </u>
              </p>
              <input type="hidden" name="amount" value={costForMonth} />

              {/*Radio input for choosing length of post*/}
              {/* <div className="flex items-center mt-2">
                <Input
                  type="radio"
                  name="postLength"
                  value={costForWeek}
                  id="1week"
                  defaultChecked={true}
                  onChange={onPostCostChange}
                />
                <label
                  className="text-lg cursor-pointer hover:opacity-70"
                  htmlFor="1week"
                >
                  Keep pinned to the top for 1 Week 📌 (${costForWeek})
                </label>
              </div>
              <div className="flex items-center mt-2">
                <Input
                  type="radio"
                  name="postLength"
                  value={costForMonth}
                  id="1month"
                  onChange={onPostCostChange}
                />
                <label
                  className="text-lg cursor-pointer hover:opacity-70"
                  htmlFor="1month"
                >
                  Keep pinned to the top for 1 Month 📌 (${costForMonth})
                </label>
              </div>
              <input type="hidden" name="amount" value={postCost} /> */}
            </div>
          </div>

          {/* Feedback to be used at a later date */}
          {/* <Label name="message" label="Feedback 📝" />
        <TextArea name="message" value={message} onChange={handleMessageChange}/> */}

          {/* Job post block */}
          <div className="pt-2 group">
            <h1 className="text-sm font-black uppercase flex justify-center md:justify-end md:mr-4 md:text-xs">
              <span className="border-2 border-black p-1 -mb-1 rounded-lg bg-yellow-400 z-10">
                Preview Job Post
              </span>
            </h1>
            <div
              className={`h-22 blocks  text-black border-[3px] border-black fixed shadow-xl overflow-hidden`}
              style={{ background: `${color}`, color: `${textColor}` }}
            >
              <div className="flex flex-row h-20 items-stretch">
                <div className="flex-initial sm:flex-none mx-4 mt-4 sm:mx-1 sm:w-1/5 sm:h-auto whitespace-normal text-sm font-light">
                  {image ? (
                    <img
                      src={image}
                      className="object-scale-down h-5/6 rounded-md shadow-xl text-xs"
                      alt="Company Logo"
                      loading="lazy"
                      decoding="async"
                      width="53"
                      height="53"
                    />
                  ) : undefined}
                </div>

                <div className="flex-auto font-Atkinson">
                  <p className="text-sm font-normal leading-tight ">
                    {company ? company : 'company'}
                  </p>
                  <p className="sm:text-sm text-lg leading-tight sm:leading-4">
                    {job ? job : 'job'}
                  </p>
                  <span
                    className="sm:text-xs text-sm font-bold whitespace-nowrap px-1 pt-0.5 rounded-sm 
                  bg-gray-200 border-solid border-2 border-black text-black"
                  >
                    💰{minsalary ? minsalary : '$???k '}-
                    {maxsalary ? maxsalary : ' $???k'}
                  </span>
                  <span
                    className="sm:text-xs text-sm font-bold whitespace-nowrap px-1 pt-0.5 rounded-sm 
                    bg-gray-200 mx-1 border-solid border-2 border-black text-black"
                  >
                    📌{state ? state : ''}
                  </span>
                  <span
                    className="sm:text-xs text-sm font-bold whitespace-nowrap px-1 pt-0.5 rounded-sm 
                    bg-gray-200 border-solid border-2 border-black text-black"
                  >
                    🕑{employment ? employment : ''}
                  </span>
                </div>

                <div className="flex-none sm:mx-0 mx-1 my-6">
                  <Link style={{ pointerEvents: 'none' }} to="/">
                    <button
                      type="button"
                      // onClick={handleButtonClick}
                      // // ! Add in button click from builder IO that looks like Duolingo
                      className="focus:outline-black text-white text-sm sm:text-xs uppercase font-bold  
                  pt-2.5 pb-1.5 px-6 sm:px-4 sm:py-1.5 sm:pb:.5 sm:hidden border-b-4 
                  border-yellow-600 bg-yellow-500 hover:bg-yellow-400 rounded-md invisible group-hover:visible
                  "
                    >
                      Apply
                    </button>
                  </Link>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 rounded-lg py-4 -my-2 mr-2 font-Atkinson sm:text-sm w-full mb-48">
              <div className="flex">
                <Link
                  style={{ pointerEvents: 'none' }}
                  to="/"
                  className="mx-auto justify-center uppercase border-solid border-4 border-black rounded-md 
              font-Atkinson font-bold mb-4 px-2 text-2xl bg-yellow-100 hover:bg-white"
                >
                  Apply here 🔗
                </Link>
              </div>
              <p
                className="max-w-prose mx-auto pl-2"
                dangerouslySetInnerHTML={{ __html: editor?.getHTML() || '' }}
              />
            </div>
          </div>
          <footer
            className="w-full h-26 sm:h-22 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 z-50
          py-4 pl-2 fixed left-0 bottom-0 grid grid-cols-4 gap-4 items-center border-t-2 border-black"
          >
            <div
              className="h-22 font-Atkinson text-black border-[3px] border-black rounded shadow-xl overflow-hidden col-span-3 sm:hidden"
              style={{
                background: `${color}`,
                color: `${textColor}`,
              }}
            >
              <div className="flex flex-row h-20 items-stretch">
                <div className="flex-initial sm:flex-none mx-4 mt-4 sm:mx-1 sm:w-1/5 sm:h-auto whitespace-normal text-sm font-light">
                  {image ? (
                    <img
                      src={image}
                      className="object-scale-down h-5/6 rounded-md shadow-xl text-xs"
                      alt="Company Logo"
                      loading="lazy"
                      decoding="async"
                      width="53"
                      height="53"
                    />
                  ) : undefined}
                </div>

                <div className="flex-auto font-Atkinson mt-1">
                  <p className="text-sm font-normal leading-tight ">
                    {company ? company : 'company'}
                  </p>
                  <p className="sm:text-sm text-lg font-bold leading-tight sm:leading-4">
                    {job ? job : 'job'}
                  </p>
                  <span
                    className="sm:text-xs text-sm font-bold whitespace-nowrap px-1 pt-0.5 rounded-sm 
                  bg-gray-200 border-solid border-2 border-black text-black"
                  >
                    💰{minsalary ? minsalary : '$???k '}-
                    {maxsalary ? maxsalary : ' $???k'}
                  </span>
                  <span
                    className="sm:text-xs text-sm font-bold whitespace-nowrap px-1 pt-0.5 rounded-sm 
                    bg-gray-200 mx-1 border-solid border-2 border-black text-black"
                  >
                    📌{state ? state : ''}
                  </span>
                  <span
                    className="sm:text-xs text-sm font-bold whitespace-nowrap px-1 pt-0.5 rounded-sm 
                    bg-gray-200 border-solid border-2 border-black text-black"
                  >
                    🕑{employment ? employment : ''}
                  </span>
                </div>

                <div className="flex-none sm:mx-0 mx-1 my-6">
                  <Link style={{ pointerEvents: 'none' }} to="/">
                    <button
                      type="button"
                      // onClick={handleButtonClick}
                      // // ! Add in button click from builder IO that looks like Duolingo
                      className="focus:outline-black text-white text-sm sm:text-xs uppercase font-bold  
                  pt-2.5 pb-1.5 px-6 sm:px-4 sm:py-1.5 sm:pb:.5 sm:hidden border-b-4 
                  border-yellow-600 bg-yellow-500 hover:bg-yellow-400 rounded-md invisible group-hover:visible
                  "
                    >
                      Apply
                    </button>
                  </Link>
                </div>
              </div>
            </div>
            <div className="mr-2 sm:col-span-4 sm:items-center">
              <button
                disabled={busy}
                className="border-[3px] border-black rounded text-2xl sm:text-xl w-full py-5 sm:py-2  h-23 mx-auto font-bold text-white bg-[#00ae86]"
                type="submit"
              >
                {busy ? 'Posting...' : `Post Job - $${displayNumCostMonth}`}
              </button>
            </div>
          </footer>
        </Form>
      </main>
    </>
  );
}
