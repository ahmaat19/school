import { useState } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../HOC/withAuth'
import Message from '../components/Message'
import Loader from 'react-loader-spinner'

import { getClassRooms } from '../api/classRoom'
import { useQuery, useMutation } from 'react-query'

import { useForm } from 'react-hook-form'
import { getPTwelveSchools } from '../api/pTwelveSchool'
import { getBranches } from '../api/branch'
import { dynamicInputSelect, inputCheckBox } from '../utils/dynamicForm'
import { getAttendances } from '../api/attendance'
import { FaSave } from 'react-icons/fa'

const Attendance = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {},
  })
  const { register: registerAttendance, handleSubmit: handleSubmitAttendance } =
    useForm({})

  const { data: classRoomData } = useQuery(
    'classRooms',
    () => getClassRooms(),
    {
      retry: 0,
    }
  )

  const { data: p12SchoolData } = useQuery(
    'pTwelveSchools',
    () => getPTwelveSchools(),
    {
      retry: 0,
    }
  )

  const { data: branchData } = useQuery('branches', () => getBranches(), {
    retry: 0,
  })

  const {
    isLoading: isLoadingClassRoomFilter,
    isError: isErrorClassRoomFilter,
    error: errorClassRoomFilter,
    isSuccess: isSuccessClassRoomFilter,
    mutateAsync: classRoomFilterMutateAsync,
    data,
  } = useMutation(getAttendances, {
    retry: 0,
    onSuccess: () => {},
  })

  const subjectData =
    classRoomData && classRoomData.filter((cl) => cl._id === watch().classRoom)

  const submitHandler = (data) => {
    classRoomFilterMutateAsync({
      classRoom: data.classRoom,
      subject: data.subject,
    })
  }

  const submitHandlerAttendance = (data) => {
    console.log(data)
    // const ent = Object.entries(data)
    // let a = []
    // // console.log(ent.map(l => ('student': l[0], 'isAttended': l[1])))
    // console.log(ent.map((e) => Object.assign({}, e)))
  }

  return (
    <div className='container'>
      <Head>
        <title>Class Room</title>
        <meta property='og:title' content='Class Room' key='title' />
      </Head>
      {isSuccessClassRoomFilter && (
        <Message variant='success'>
          Student has been fetched successfully.
        </Message>
      )}
      {isErrorClassRoomFilter && (
        <Message variant='danger'>{errorClassRoomFilter}</Message>
      )}

      <form onSubmit={handleSubmit(submitHandler)}>
        <div className='row'>
          <div className='col-md-3 col-6'>
            {dynamicInputSelect({
              register,
              label: 'Branch',
              errors,
              name: 'branch',
              data: branchData && branchData,
            })}
          </div>
          <div className='col-md-3 col-6'>
            {watch().branch &&
              dynamicInputSelect({
                register,
                label: 'P12 School',
                errors,
                name: 'pTwelveSchool',
                data:
                  p12SchoolData &&
                  p12SchoolData.filter((p) => p.branch._id === watch().branch),
              })}
          </div>
          <div className='col-md-2 col-4'>
            {watch().pTwelveSchool &&
              dynamicInputSelect({
                register,
                label: 'Class Room',
                errors,
                name: 'classRoom',
                data:
                  classRoomData &&
                  classRoomData.filter(
                    (s) => s.pTwelveSchool._id === watch().pTwelveSchool
                  ),
              })}
          </div>
          <div className='col-md-2 col-4'>
            {watch().classRoom &&
              dynamicInputSelect({
                register,
                label: 'Subject',
                errors,
                name: 'subject',
                data:
                  subjectData &&
                  subjectData[0] &&
                  subjectData[0].subject &&
                  subjectData[0].subject,
              })}
          </div>

          <div className='col-md-2 col-4 my-auto'>
            <button
              type='submit'
              className='btn btn-primary btn-lg mt-2 form-control shadow'
              disabled={isLoadingClassRoomFilter}
            >
              {isLoadingClassRoomFilter ? (
                <span className='spinner-border spinner-border-sm' />
              ) : (
                'Search'
              )}
            </button>
          </div>
        </div>
      </form>

      {isLoadingClassRoomFilter ? (
        <div className='text-center'>
          <Loader
            type='ThreeDots'
            color='#00BFFF'
            height={100}
            width={100}
            timeout={3000} //3 secs
          />
        </div>
      ) : isErrorClassRoomFilter ? (
        <Message variant='danger'>{errorClassRoomFilter}</Message>
      ) : (
        <form onSubmit={handleSubmitAttendance(submitHandlerAttendance)}>
          <div className='table-responsive '>
            <table className='table table-sm hover bordered striped caption-top '>
              <caption>
                {data && data.student.length} records were found
              </caption>
              <thead>
                <tr>
                  <th>ROLL NO. </th>
                  <th>STUDENT</th>
                  <th>BRANCH</th>
                  <th>CLASS ROOM</th>
                  <th>SUBJECT</th>
                  <th>ATTEND</th>
                  <th>
                    <button className='btn btn-primary btn-sm shadow'>
                      <FaSave className='mb-1' />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data &&
                  data.student &&
                  data.student.map((student) => (
                    <tr key={student.student && student.student._id}>
                      <td>{student.student && student.student.rollNo}</td>
                      <td>{student.student && student.student.name}</td>
                      <td>{data.branch && data.branch.name}</td>
                      <td>{data.classRoom && data.classRoom.name}</td>
                      <td>{data.subject && data.subject.name}</td>
                      <td>
                        {inputCheckBox({
                          register: registerAttendance,
                          errors,
                          label: 'Is Attended?',
                          name: student.student && student.student._id,
                          isRequired: false,
                        })}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </form>
      )}
    </div>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Attendance)), {
  ssr: false,
})
