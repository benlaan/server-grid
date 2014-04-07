using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace GridExperiment.Controllers
{
    public class Person
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime BirthDate { get; set; }
    }

    public class GridPage
    {
        public int Index { get; set; }
        public int Size { get; set; }
    }

    public enum SortMode
    {
        None,
        Asc,
        Desc
    }

    public class Column
    {
        public int SortIndex { get; set; }
        public SortMode Sort { get; set; }
        public string Name { get; set; }
    }

    public class GridState
    {
        /// <summary>
        /// Initializes a new instance of the GridState class.
        /// </summary>
        public GridState()
        {
            Page = new GridPage();
            Columns = new List<Column>();
        }

        public GridPage Page { get; set; }
        public List<Column> Columns { get; set; }
    }

    public class PersonController : ApiController
    {
        static Dictionary<int, Person> _data;

        static PersonController()
        {
            var data = new[] 
            {
                new Person { FirstName = "Ben",  LastName = "Laan",    BirthDate = new DateTime(1975,  4, 3) },
                new Person { FirstName = "John", LastName = "Smith",   BirthDate = new DateTime(1985,  7, 5) },
                new Person { FirstName = "Wu",   LastName = "Ching",   BirthDate = new DateTime(1972, 10, 12) },
                new Person { FirstName = "Raaj", LastName = "Patak",   BirthDate = new DateTime(1974, 11, 30) },
                new Person { FirstName = "Hans", LastName = "Schultz", BirthDate = new DateTime(1972, 12, 31) },
            };

            for (int i = 0; i < data.Length; i++)
            {
                data[i].Id = i + 1;
            }

            _data = data.ToDictionary(p => p.Id, p => p);
        }

        // GET api/<controller>
        public IEnumerable<Person> Get([FromUri]GridState gridState)
        {
            return _data.Values
                .Skip((gridState.Page.Index - 1) * gridState.Page.Size)
                .Take(gridState.Page.Size)
                .ToList();
        }

        // GET api/<controller>/5
        public Person Get(int id)
        {
            return _data[id];
        }

        // POST api/<controller>
        public void Post([FromBody]Person value)
        {
        }

        // PUT api/<controller>/5
        public void Put(int id, [FromBody]Person value)
        {
        }

        // DELETE api/<controller>/5
        public void Delete(int id)
        {
        }
    }
}