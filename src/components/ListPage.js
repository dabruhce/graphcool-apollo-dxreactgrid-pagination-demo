import React from 'react'
import { Link } from 'react-router-dom'
import Post from '../components/Post'
import { gql, graphql } from 'react-apollo'
//import Button from 'material-ui/Button';
import {
  Grid, TableView, TableHeaderRow, PagingPanel,
} from '@devexpress/dx-react-grid-material-ui';

import {
  PagingState,
  SortingState,
} from '@devexpress/dx-react-grid';

const styles = {
  card: {
//    maxWidth: 345,
    display: 'inline-block',
    margin: 10,
  },
  root: {
    width: '100%',
//    marginTop: theme.spacing.unit * 3,
  },
  table: {
    minWidth: 800,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
};


class ListPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      columns: [
        { name: 'imageUrl', title: 'imageUrl' },
        { name: 'description', title: 'description' },
      ],
      rows: [],
      sorting: [{ columnName: 'description', direction: 'asc' }],
      totalCount: 0,
      pageSize: 10,
      allowedPageSizes: [10],
      currentPage: 0,
      loading: true,
      allPosts: props.allPosts
    };

    this.changeSorting = this.changeSorting.bind(this);
    this.changeCurrentPage = this.changeCurrentPage.bind(this);
    this.changePageSize = this.changePageSize.bind(this);
  }

  componentDidMount() {
   this.loadData();
 }
 componentDidUpdate() {
   this.loadData();
 }
 changeSorting(sorting) {
   this.setState({
     loading: true,
     sorting,
   });
 }
 changeCurrentPage(currentPage) {
   //const offset = (1 + this.state.currentPage) * this.state.pageSize;
  // this.props.loadMorePosts(offset)
   this.setState({
     loading: true,
     currentPage,
   });
 }
 changePageSize(pageSize) {
   const totalPages = Math.ceil(this.state.totalCount / pageSize);
   const currentPage = Math.min(this.state.currentPage, totalPages - 1);

   this.setState({
     loading: true,
     pageSize,
     currentPage,
   });
 }

 loadData() {
   const offset = (this.state.currentPage) * this.state.pageSize;
   this.props.loadMorePosts(offset)

 }

  render() {
    let props = this.props;

    if (this.props.data.loading) {
      return (
        <div className='flex w-100 h-100 items-center justify-center pt7'>
          <div>
            Loading...
            (from {process.env.REACT_APP_GRAPHQL_ENDPOINT})
          </div>
        </div>
      )
    }

    let blurClass = ''

    if (this.props.location.pathname !== '/') {
      blurClass = ' blur'
    }


    const {
        columns,
        sorting,
        pageSize,
        allowedPageSizes,
        currentPage,
        loading,
      } = this.state;

    let totalCount =   this.props.data.meta.count
    const totalPages = Math.ceil(totalCount / pageSize);

    let rows = this.props.data.allPosts


    return (
      <div className={'w-100 flex justify-center pa6' + blurClass}>
        <div className='w-100 flex flex-wrap' style={{maxWidth: 1150}}>
          <Link
            to='/create'
            className='ma3 box new-post br2 flex flex-column items-center justify-center ttu fw6 f20 black-30 no-underline'
          >
            <img
              src={require('../assets/plus.svg')}
              alt=''
              className='plus mb3'
            />
            <div>New Post</div>
          </Link>
          <Grid
              rows={rows}
              columns={columns}>
              <SortingState
                sorting={sorting}
                onSortingChange={this.changeSorting}
              />
              <PagingState
               currentPage={currentPage}
               onCurrentPageChange={this.changeCurrentPage}
               pageSize={pageSize}
               onPageSizeChange={this.changePageSize}
               totalCount={totalCount}
             />
              <TableView />
              <TableHeaderRow />
              <PagingPanel
                allowedPageSizes={allowedPageSizes}
              />
            </Grid>
        </div>
        {this.props.children}
      </div>
    )
  }
}

const FeedQuery = gql`query allPosts($first: Int!, $skip: Int!) {
  allPosts(orderBy: createdAt_DESC, first: $first, skip: $skip) {
    id
    imageUrl
    description
  }
  meta: _allPostsMeta {
    count
  }
}`

const ListPageWithData = graphql(FeedQuery, {
  options(props) {
  return {
    variables: {
      skip: 0,
      first: 10
    },
    fetchPolicy: 'network-only'
    };
  },
  props: ({ ownProps, data, meta = {}, variables }) => ({
      data,
      hasMore: meta.count === undefined || meta.count > data.allPosts.length,
      loadMorePosts: (offset) => {
        data.fetchMore({
          variables: {
           skip: offset
         },
       updateQuery: (previousResult, { fetchMoreResult }) => {
            if (!fetchMoreResult) return previousResult;
            return {
              ...previousResult,
              allPosts: [...fetchMoreResult.allPosts]
            };
          }
        });
      }
    }),
})(ListPage)

export default ListPageWithData
