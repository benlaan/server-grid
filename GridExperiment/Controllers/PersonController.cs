﻿using System;
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
                new Person { FirstName = "Rick",  LastName = "Laan",    BirthDate = new DateTime(1975,  4, 3) },
                new Person { FirstName = "Greg", LastName = "Smith",   BirthDate = new DateTime(1985,  7, 5) },
                new Person { FirstName = "Chin",   LastName = "Ching",   BirthDate = new DateTime(1972, 10, 12) },
                new Person { FirstName = "Sandip", LastName = "Patak",   BirthDate = new DateTime(1974, 11, 30) },
                new Person { FirstName = "Yann", LastName = "Schultz", BirthDate = new DateTime(1972, 12, 31) },
                new Person { FirstName = "Fred",  LastName = "Laan",    BirthDate = new DateTime(1975,  4, 3) },
                new Person { FirstName = "Jane", LastName = "Smith",   BirthDate = new DateTime(1989,  7, 5) },
                new Person { FirstName = "Shen",   LastName = "Ching",   BirthDate = new DateTime(1972, 10, 12) },
                new Person { FirstName = "Gunjan", LastName = "Patak",   BirthDate = new DateTime(1974, 11, 30) },
                new Person { FirstName = "Pete", LastName = "Schultz", BirthDate = new DateTime(1972, 12, 31) },
                new Person { FirstName = "Rob",  LastName = "Laan",    BirthDate = new DateTime(1975,  4, 3) },
                new Person { FirstName = "Mary", LastName = "Smith",   BirthDate = new DateTime(1989,  7, 5) },
                new Person { FirstName = "Zhao",   LastName = "Ching",   BirthDate = new DateTime(1968, 10, 12) },
                new Person { FirstName = "Shruti", LastName = "Patak",   BirthDate = new DateTime(1974, 11, 30) },
                new Person { FirstName = "Gretel", LastName = "Schultz", BirthDate = new DateTime(1968, 12, 31) },
                new Person { FirstName = "Ben",  LastName = "Jones",    BirthDate = new DateTime(1975,  4, 3) },
                new Person { FirstName = "John", LastName = "Kerr",   BirthDate = new DateTime(1989,  7, 5) },
                new Person { FirstName = "Wu",   LastName = "Zheng",   BirthDate = new DateTime(1968, 10, 12) },
                new Person { FirstName = "Raaj", LastName = "Chapati",   BirthDate = new DateTime(1974, 11, 30) },
                new Person { FirstName = "Hans", LastName = "Schroder", BirthDate = new DateTime(1968, 12, 31) },
                new Person { FirstName = "Ben",  LastName = "Kreeg",    BirthDate = new DateTime(1975,  4, 3) },
                new Person { FirstName = "John", LastName = "Smyth",   BirthDate = new DateTime(1989,  7, 5) },
                new Person { FirstName = "Wu",   LastName = "Chu",   BirthDate = new DateTime(1968, 10, 12) },
                new Person { FirstName = "Anu", LastName = "Halathi",   BirthDate = new DateTime(1974, 11, 30) },
                new Person { FirstName = "Hans", LastName = "Heinrich", BirthDate = new DateTime(1968, 12, 31) },
                new Person { FirstName = "Lin",  LastName = "Laan",    BirthDate = new DateTime(1975,  4, 3) },
                new Person { FirstName = "Heather", LastName = "Smith",   BirthDate = new DateTime(1985,  7, 5) },
                new Person { FirstName = "Mun",   LastName = "Ching",   BirthDate = new DateTime(1968, 10, 12) },
                new Person { FirstName = "Alfredo", LastName = "Giro",   BirthDate = new DateTime(1974, 11, 30) },
                new Person { FirstName = "Pierre", LastName = "Lero", BirthDate = new DateTime(1968, 12, 31) },
            };

            for (int i = 0; i < data.Length; i++)
            {
                data[i].Id = i + 1;
            }

            _data = data.ToDictionary(p => p.Id, p => p);
        }

        [HttpGet]
        public int GetRowCount([FromUri]GridState gridState)
        {
            return _data.Values.Count();
        }

        // GET api/<controller>
        public IEnumerable<Person> GetData([FromUri]GridState gridState)
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